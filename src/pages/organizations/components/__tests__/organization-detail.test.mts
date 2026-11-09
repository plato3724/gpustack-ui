import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { after, mock, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import {
  act,
  forwardRef,
  createElement as h,
  useImperativeHandle
} from 'react';
import { createRoot } from 'react-dom/client';
import type { MemberItem } from '../../config/types';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
Object.defineProperties(globalThis, {
  window: { configurable: true, value: dom.window },
  document: { configurable: true, value: dom.window.document },
  navigator: { configurable: true, value: dom.window.navigator },
  IS_REACT_ACT_ENVIRONMENT: { configurable: true, value: true }
});
after(() => dom.window.close());

// Keep the real request lifecycle, submit lock, columns and API wrappers.
// Replace visual shells only, to exercise actions without CSS/portal setup.
const require = createRequire(import.meta.url);
// Match the repository's ESM test runner: use ahooks' equivalent CJS helpers
// rather than allowing tsx to re-export tslib's ESM wrapper onto itself.
const requireAhooks = createRequire(require.resolve('ahooks'));
const tslib = requireAhooks('tslib/tslib.js');
mock.module(requireAhooks.resolve('tslib'), {
  namedExports: tslib,
  defaultExport: tslib
});
const { default: useSubmitLock } = await import(
  pathToFileURL(
    join(
      dirname(require.resolve('@gpustack/core-ui')),
      'lib/hooks/use-submit-lock.es.js'
    )
  ).href
);
const success = mock.fn();
let confirmation: { onOk: () => Promise<void> };
const shell = ({ children }: any) => h('div', null, children);
mock.module('antd', {
  namedExports: {
    Alert: ({ title, action }: any) =>
      h('div', { role: 'alert' }, title, action),
    Button: ({ children, onClick, disabled }: any) =>
      h('button', { onClick, disabled }, children),
    Descriptions: ({ items }: any) =>
      h(
        'div',
        null,
        items.map((item: any) => h('p', { key: item.key }, item.children))
      ),
    Drawer: shell,
    Empty: Object.assign(shell, { PRESENTED_IMAGE_SIMPLE: 'empty' }),
    Flex: shell,
    Space: shell,
    Spin: shell,
    Typography: { Title: shell },
    Select: ({ value, onChange, options, disabled }: any) =>
      h(
        'select',
        {
          value,
          disabled,
          onChange: (event: any) => onChange(event.target.value)
        },
        options.map((option: any) =>
          h('option', { key: option.value, value: option.value }, option.label)
        )
      ),
    message: { success }
  }
});
mock.module('@gpustack/core-ui', {
  namedExports: {
    AutoTooltip: shell,
    ThemeTag: shell,
    useSubmitLock,
    useBodyScroll: () => ({ saveScrollHeight() {}, restoreScrollHeight() {} }),
    DeleteModal: forwardRef((_, ref) => {
      useImperativeHandle(ref, () => ({
        show: (options: any) => {
          confirmation = options;
        }
      }));
      return null;
    }),
    Table: ({ columns, dataSource }: any) =>
      h(
        'div',
        null,
        dataSource.map((row: MemberItem) =>
          h(
            'div',
            {
              key: row.principal_id,
              'data-member': row.principal_id
            },
            columns.map((column: any) =>
              h(
                'div',
                { key: column.key },
                column.render?.(row[column.dataIndex as keyof MemberItem], row)
              )
            )
          )
        )
      )
  }
});
mock.module(new URL('../add-member-modal.tsx', import.meta.url).href, {
  defaultExport: ({ onOk }: any) =>
    h(
      'button',
      {
        onClick: () => onOk({ principal_ids: [91, 92], role: 'owner' })
      },
      'submit members'
    )
});

const owner: MemberItem = {
  principal_id: 31,
  principal_kind: 'user',
  principal_name: 'alice',
  principal_display_name: 'Alice',
  principal_description: null,
  organization_id: 7,
  role: 'owner',
  created_at: '2026-11-09T01:00:00Z'
};
const group: MemberItem = {
  ...owner,
  principal_id: 55,
  principal_kind: 'group',
  principal_name: 'team',
  principal_display_name: null,
  role: 'member'
};
const org = {
  id: 7,
  name: 'research',
  display_name: 'Research',
  description: null,
  created_at: owner.created_at
};
let roleRejected = false;
let removeRejected = false;
let loadRejected = false;
let members = [owner, group];
const handleRequest = async (url: string, options: any) => {
  if (loadRejected && options.method === 'GET') throw new Error('Unavailable');
  if (url === '/organizations/7') return org;
  if (options.method === 'GET') return members;
  if (options.method === 'PUT') {
    if (roleRejected) throw new Error('Cannot demote the only owner');
    return { ...owner, role: options.data.role };
  }
  if (options.method === 'DELETE') {
    if (removeRejected) throw new Error('API keys still exist');
    return undefined;
  }
  return [
    { ...owner, principal_id: 91, principal_name: 'bob' },
    { ...group, principal_id: 92, principal_name: 'new-team', role: 'owner' }
  ];
};
const request = mock.fn(handleRequest);
mock.module('@umijs/max', {
  namedExports: {
    request,
    useIntl: () => ({ formatMessage: ({ id }: any) => id })
  }
});
const { default: OrganizationDetail } =
  await import('../organization-detail.tsx');
const container = document.getElementById('root')!;
const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};
const render = async () => {
  request.mock.resetCalls();
  success.mock.resetCalls();
  members = [owner, group];
  const root = createRoot(container);
  await act(async () =>
    root.render(h(OrganizationDetail, { organizationId: 7, onClose() {} }))
  );
  await flush();
  return () => act(async () => root.unmount());
};
const row = (id: number) => container.querySelector(`[data-member="${id}"]`)!;
const button = (text: string, scope: ParentNode = container) => {
  const found = [...scope.querySelectorAll('button')].find(
    (item) => item.textContent === text
  );
  assert.ok(found, `Missing button ${text}`);
  return found;
};

test('a rejected role change retains the server role and releases the lock for retry', async () => {
  const unmount = await render();
  const change = async () => {
    await act(async () => {
      const select = row(31).querySelector('select')!;
      select.value = 'member';
      select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    await flush();
  };
  roleRejected = true;
  await change();
  assert.equal(row(31).querySelector('select')!.value, 'owner');
  assert.equal(success.mock.callCount(), 0);
  roleRejected = false;
  await change();
  assert.equal(row(31).querySelector('select')!.value, 'member');
  assert.deepEqual(request.mock.calls.at(-1)!.arguments, [
    '/organizations/7/members/31',
    { method: 'PUT', data: { role: 'member' } }
  ]);
  await unmount();
});

test('removal waits for confirmation and success; adding users and groups sends principal ids', async () => {
  const unmount = await render();
  await act(async () =>
    button('organizations.members.remove', row(55)).click()
  );
  assert.equal(
    request.mock.calls.filter((call) => call.arguments[1].method === 'DELETE')
      .length,
    0
  );
  removeRejected = true;
  await act(async () => {
    await assert.rejects(confirmation.onOk(), /API keys/);
  });
  assert.ok(row(55));
  removeRejected = false;
  await act(async () => {
    await confirmation.onOk();
  });
  assert.equal(container.querySelector('[data-member="55"]'), null);
  await act(async () => button('organizations.members.add').click());
  await act(async () => button('submit members').click());
  assert.ok(row(91));
  assert.ok(row(92));
  assert.deepEqual(request.mock.calls.at(-1)!.arguments, [
    '/organizations/7/members',
    { method: 'POST', data: { principal_ids: [91, 92], role: 'owner' } }
  ]);
  await unmount();
});

test('detail load failure offers retry and recovers without remounting', async () => {
  loadRejected = true;
  const unmount = await render();
  assert.ok(container.querySelector('[role="alert"]'));
  loadRejected = false;
  await act(async () => button('organizations.retry').click());
  await flush();
  assert.ok(row(31));
  assert.ok(row(55));
  await unmount();
});

test('late responses from a closed organization cannot replace the next detail', async () => {
  let resolveOld!: (value: unknown) => void;
  const old = new Promise((resolve) => {
    resolveOld = resolve;
  });
  request.mock.mockImplementation((url, options) =>
    url === '/organizations/8' ? old : handleRequest(url, options)
  );
  const root = createRoot(container);
  await act(async () =>
    root.render(
      h(OrganizationDetail, { key: 8, organizationId: 8, onClose() {} })
    )
  );
  await act(async () =>
    root.render(
      h(OrganizationDetail, { key: 7, organizationId: 7, onClose() {} })
    )
  );
  await flush();
  await act(async () => {
    resolveOld({ ...org, id: 8, name: 'stale-org' });
  });
  await flush();
  assert.ok(container.textContent?.includes('research'));
  assert.ok(!container.textContent?.includes('stale-org'));
  await act(async () => root.unmount());
  request.mock.mockImplementation(handleRequest);
});
