// ts: 属性面板通用方法

/**
 * 创建 Property实例
 * @param prefix
 * @param options
 */
export function createProperty(prefix: string, options: any) {
  const { name, value } = options;
  return window.bpmnInstance.moddle?.create(`${prefix}:Property`, {
    name,
    value,
  });
}

/**
 * 创建 Properties实例
 * @param prefix
 * @param options
 */
export function createProperties(prefix: string, options: any) {
  const { properties } = options;
  return window.bpmnInstance.moddle?.create(`${prefix}:Properties`, {
    values: properties,
  });
}

/**
 * 获取 指定suffix类型扩展属性
 * @param prefix
 * @param suffix
 */
export function extractExtensionList(prefix: string, suffix: string) {
  let extensionElements: any =
    window.bpmnInstance?.element.businessObject.extensionElements;
  let properties: any[] =
    extensionElements?.values?.find(
      (e: any) => e.$type === `${prefix}:${suffix}`,
    )?.values || [];
  return properties;
}

/**
 * 获取 非suffix类型扩展属性
 * @param prefix
 * @param suffix
 */
export function extractOtherExtensionList(prefix: string, suffix: string) {
  let extensionElements: any =
    window.bpmnInstance?.element.businessObject.extensionElements;
  let otherProperties: any[] =
    extensionElements?.values?.filter(
      (el: any) => el.$type !== `${prefix}:${suffix}`,
    ) || [];
  return otherProperties;
}

/**
 * 更新 扩展属性
 * @param extensionList
 */
export function updateElementExtensions(extensionList: Array<any>) {
  const extensions = window.bpmnInstance?.moddle?.create(
    'bpmn:ExtensionElements',
    {
      values: extensionList,
    },
  );
  window.bpmnInstance?.modeling?.updateProperties(
    window.bpmnInstance?.element,
    {
      extensionElements: extensions,
    },
  );
}
