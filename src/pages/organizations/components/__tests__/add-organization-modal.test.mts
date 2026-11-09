import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { after, mock, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
for (const name of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'Element',
  'SVGElement',
  'Node',
  'MutationObserver',
  'ShadowRoot',
  'getComputedStyle'
]) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: (dom.window as any)[name]
  });
}
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
  configurable: true,
  value: true
});
dom.window.matchMedia = () =>
  ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {}
  }) as any;
after(() => dom.window.close());

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
const fields = new Map<string, (event: unknown) => void>();
const InputField = ({ label, value, onChange, disabled }: any) => {
  fields.set(label, onChange);
  return h('input', {
    'aria-label': label,
    value: value ?? '',
    onChange,
    disabled
  });
};
mock.module('@gpustack/core-ui', {
  namedExports: {
    Input: { Input: InputField, TextArea: InputField },
    FormDrawer: ({ children, onSubmit }: any) =>
      h('div', null, children, h('button', { onClick: onSubmit }, 'submit')),
    useSubmitLock,
    useAppUtils: () => ({ getRuleMessage: (_: string, id: string) => id })
  }
});
mock.module('@umijs/max', {
  namedExports: { useIntl: () => ({ formatMessage: ({ id }: any) => id }) }
});
const { default: AddOrganizationModal } =
  await import('../add-organization-modal.tsx');
const container = document.getElementById('root')!;
const setField = async (name: string, value: string) => {
  await act(async () => fields.get(name)!({ target: { value } }));
};
const submit = async () => {
  await act(async () => container.querySelector('button')!.click());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
};

test('create validates identifiers and display names, then submits Chinese display name and optional description', async () => {
  const onOk = mock.fn(async () => {});
  const root = createRoot(container);
  await act(async () =>
    root.render(h(AddOrganizationModal, { onOk, onCancel() {} }))
  );
  await submit();
  assert.equal(onOk.mock.callCount(), 0);
  await setField('common.table.displayName', '研发团队');
  for (const name of ['Uppercase', 'trailing-', 'personal', 'user-42']) {
    await setField('organizations.name', name);
    await submit();
    assert.equal(onOk.mock.callCount(), 0, name);
  }
  await setField('organizations.name', 'research-42');
  await setField('common.table.displayName', 'Global');
  await submit();
  assert.equal(onOk.mock.callCount(), 0);
  await setField('common.table.displayName', '研发团队');
  await submit();
  assert.equal(onOk.mock.callCount(), 1);
  assert.deepEqual(onOk.mock.calls[0].arguments[0], {
    name: 'research-42',
    display_name: '研发团队',
    description: undefined
  });
  await act(async () => root.unmount());
});

test('edit keeps the identifier immutable and a rapid double submit sends one request', async () => {
  let finish!: () => void;
  const onOk = mock.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  const root = createRoot(container);
  const currentData = {
    id: 7,
    name: 'research',
    display_name: '研发团队',
    description: '说明'
  } as any;
  await act(async () =>
    root.render(h(AddOrganizationModal, { currentData, onOk, onCancel() {} }))
  );
  assert.ok(
    container.querySelector<HTMLInputElement>(
      '[aria-label="organizations.name"]'
    )!.disabled
  );
  await act(async () => {
    container.querySelector('button')!.click();
    container.querySelector('button')!.click();
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
  assert.equal(onOk.mock.callCount(), 1);
  await act(async () => finish());
  await act(async () => root.unmount());
});
