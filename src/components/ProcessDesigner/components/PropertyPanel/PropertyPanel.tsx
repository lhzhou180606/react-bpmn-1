import React, { useEffect, useState } from 'react';
import { Collapse, Space, Typography } from 'antd';
import ElementBaseInfo from '@/bpmn/panel/ElementBaseInfo/ElementBaseInfo';

import ElementOtherInfo from '@/bpmn/panel/ElementOtherInfo/ElementOtherInfo';
import ExtensionProperties from '@/bpmn/panel/ExtensionProperties/ExtensionProperties';
import SignalMessage from '@/bpmn/panel/SignalMessage/SignalMessage';
import ElementListener from '@/bpmn/panel/ElementListener/ElementListener';
import ElementTask from '@/bpmn/panel/ElementTask/ElementTask';
import MultiInstance from '@/bpmn/panel/MultiInstance/MultiInstance';
import ElementForm from '@/bpmn/panel/ElementForm/ElementForm';
import {
  BellOutlined,
  MessageOutlined,
  PlusOutlined,
  PlusSquareTwoTone,
  PushpinTwoTone,
} from '@ant-design/icons';
import { initBpmnInstance } from '@/util/windowUtil';

interface IProps {
  modeler: any;
  processId?: string;
}

/**
 * 属性面板
 * @param props
 * @constructor
 */
export default function PropertyPanel(props: IProps) {
  // props属性
  const { modeler, processId } = props;

  // setState属性
  const [element, setElement] = useState<any>();
  const [businessObject, setBusinessObject] = useState<any>();
  const [modeling, setModeling] = useState<any>();
  const [bpmnFactory, setBpmnFactory] = useState<any>();
  const [moddle, setModdel] = useState<any>();
  const [rootElements, setRootElements] = useState([]);

  useEffect(() => {
    initBpmnInstance();
    // 避免初始化，流程图未加载完导致出错
    if (modeler) {
      init();
    }
  }, [modeler]);

  function init() {
    // 设置window的bpmnInstance对象属性
    window.bpmnInstance.modeler = modeler;
    window.bpmnInstance.elementRegistry = modeler.get('elementRegistry');
    window.bpmnInstance.modeling = modeler.get('modeling', true);
    window.bpmnInstance.bpmnFactory = modeler.get('bpmnFactory', true);
    window.bpmnInstance.moddle = modeler.get('moddle', true);

    // 获取modeling
    setModeling(modeler.get('modeling', true));
    // 获取bpmnFactory
    setBpmnFactory(modeler.get('bpmnFactory', true));
    // 获取moddle
    setModdel(modeler.get('moddle', true));

    // 设置监听器，监听所有工作就绪后，要做的事
    modeler?.on('import.done', (e: any) => {
      confirmCurrentElement(null);
      // 获取rootElements
      setRootElements(modeler.getDefinitions().rootElements);
      window.bpmnInstance.rootElements = modeler.getDefinitions().rootElements;
    });

    // 设置监听器，监听选中节点变化 (特别注意：监听器只能设置一次，如果执行多次，会设置多个监听器)
    modeler?.on('selection.changed', (e: any) => {
      confirmCurrentElement(e.newSelection[0] || null);
    });

    // 设置监听器，监听当前节点属性变化
    modeler?.on('element.changed', ({ element }: any) => {
      if (
        element &&
        element.id === window.bpmnInstance.element.businessObject.id
      ) {
        confirmCurrentElement(element);
      }
    });
  }

  /**
   * 确认当前选中节点
   * @param element
   */
  function confirmCurrentElement(element: any) {
    // 如果element为空，则设置流程节点为当前节点，否则设置选中节点为当前节点 (点击canvas空白处默认指流程节点)
    if (!element) {
      // todo 目前是通过流程id获取，但是这个id固定不好，后面要修改
      /* todo 获取流程节点可以通过这个方法获取
      function getProcess$1(element) {
        return is$3(element, 'bpmn:Process') ? getBusinessObject(element) : getBusinessObject(element).get('processRef');
      }*/
      console.log(processId);
      let processElement: any = modeler.get('elementRegistry').get(processId);
      setElement(processElement);
      window.bpmnInstance.element = processElement;
      setBusinessObject(
        JSON.parse(JSON.stringify(processElement?.businessObject || null)),
      );
      console.log(
        '当前选中的元素为: \n',
        modeler.get('elementRegistry').get(processId)?.businessObject ||
          '初始化还未选中Process节点',
      );
      return;
    }
    console.log('当前选中的元素为11: \n', element?.businessObject);
    window.bpmnInstance.element = element;
    setBusinessObject(JSON.parse(JSON.stringify(element.businessObject)));
    setElement(element);
  }

  /**
   * 渲染 常规信息 组件
   * 1、所有节点都有
   */
  function renderElementBaseInfo() {
    return (
      <Collapse.Panel
        header={
          <Typography style={{ color: '#1890ff', fontWeight: 'bold' }}>
            <PushpinTwoTone />
            &nbsp;常规
          </Typography>
        }
        key={1}
        style={{ backgroundColor: '#FFF' }}
        showArrow={true}
        forceRender={false}
      >
        <ElementBaseInfo businessObject={businessObject} />
      </Collapse.Panel>
    );
  }

  /**
   * 渲染 消息与信号 组件
   * 1、只有 Process 有
   */
  function renderSignalMessage() {
    if (element?.type === 'bpmn:Process') {
      return (
        <Collapse.Panel
          header={
            <Typography style={{ color: '#1890ff', fontWeight: 'bold' }}>
              <MessageOutlined />
              &nbsp;消息与信号
            </Typography>
          }
          key={3}
          style={{ backgroundColor: '#FFF' }}
          showArrow={true}
          forceRender={false}
        >
          <SignalMessage businessObject={businessObject} />
        </Collapse.Panel>
      );
    }
  }

  /**
   * 渲染 表单 组件
   * 1、只有 UserTask 或 StartEvent 有
   */
  function renderElementForm() {
    if (
      element?.type === 'bpmn:UserTask' ||
      element?.type === 'bpmn:StartEvent'
    ) {
      return (
        <Collapse.Panel
          header={
            <Typography style={{ color: '#1890ff', fontWeight: 'bold' }}>
              <MessageOutlined />
              &nbsp;表单
            </Typography>
          }
          key={4}
          style={{ backgroundColor: '#FFF' }}
          showArrow={true}
          forceRender={false}
        >
          <ElementForm businessObject={businessObject} />
        </Collapse.Panel>
      );
    }
  }

  /**
   * 渲染 任务 组件
   * 1、所有 Task 类节点都有
   */
  function renderElementTask() {
    if (element?.type.indexOf('Task') !== -1) {
      return (
        <Collapse.Panel
          header={
            <Typography style={{ color: '#1890ff', fontWeight: 'bold' }}>
              <PushpinTwoTone />
              &nbsp;任务
            </Typography>
          }
          key={5}
          style={{ backgroundColor: '#FFF' }}
          showArrow={true}
          forceRender={false}
        >
          <ElementTask businessObject={businessObject} />
        </Collapse.Panel>
      );
    }
  }

  /**
   * 渲染 多实例 组件
   * 1、所有 Task 类节点都有
   */
  function renderMultiInstance() {
    if (element?.type.indexOf('Task') !== -1) {
      return (
        <Collapse.Panel
          header={
            <Typography style={{ color: '#1890ff', fontWeight: 'bold' }}>
              <PushpinTwoTone />
              &nbsp;多实例
            </Typography>
          }
          key={6}
          style={{ backgroundColor: '#FFF' }}
          showArrow={true}
          forceRender={false}
        >
          <MultiInstance businessObject={businessObject} />
        </Collapse.Panel>
      );
    }
  }

  /**
   * 渲染 执行监听器 组件
   * 1、所有节点都有
   */
  function renderElementListener() {
    return (
      <Collapse.Panel
        header={
          <Typography style={{ color: '#1890ff', fontWeight: 'bold' }}>
            <BellOutlined />
            &nbsp;执行监听器
          </Typography>
        }
        key={7}
        style={{ backgroundColor: '#FFF' }}
        showArrow={true}
        forceRender={false}
      >
        <ElementListener businessObject={businessObject} isTask={false} />
      </Collapse.Panel>
    );
  }

  /**
   * 渲染 任务监听器 组件
   * 1、只有 UserTask 才有
   */
  function renderElementListenerOfTask() {
    if (element?.type === 'bpmn:UserTask') {
      return (
        <Collapse.Panel
          header={
            <Typography style={{ color: '#1890ff', fontWeight: 'bold' }}>
              <PlusOutlined />
              &nbsp;任务监听器
            </Typography>
          }
          key={8}
          style={{ backgroundColor: '#FFF' }}
          showArrow={true}
          forceRender={false}
        >
          <ElementListener businessObject={businessObject} isTask={true} />
        </Collapse.Panel>
      );
    }
  }

  /**
   * 渲染 扩展属性 组件
   * 1、所有节点都有
   */
  function renderExtensionProperties() {
    return (
      <Collapse.Panel
        header={
          <Typography style={{ color: '#1890ff', fontWeight: 'bold' }}>
            <PlusSquareTwoTone />
            &nbsp;扩展属性
          </Typography>
        }
        key={10}
        style={{ backgroundColor: '#FFF' }}
        showArrow={true}
        forceRender={false}
      >
        <ExtensionProperties businessObject={businessObject} />
      </Collapse.Panel>
    );
  }

  /**
   * 渲染 其它属性(元素文档) 组件
   * 1、所有节点都有
   */
  function renderElementOtherInfo() {
    return (
      <Collapse.Panel
        header={
          <Typography style={{ color: '#1890ff', fontWeight: 'bold' }}>
            <PlusSquareTwoTone />
            &nbsp;其它属性
          </Typography>
        }
        key={11}
        style={{ backgroundColor: '#FFF' }}
        showArrow={true}
        forceRender={false}
      >
        <ElementOtherInfo businessObject={businessObject} />
      </Collapse.Panel>
    );
  }

  return (
    <>
      <Space direction="vertical" size={0} style={{ display: 'flex' }}>
        <Collapse
          bordered={false}
          expandIconPosition={'right'}
          accordion
          defaultActiveKey={['1']}
          destroyInactivePanel={true}
        >
          {renderElementBaseInfo()}
          {renderSignalMessage()}
          {renderElementForm()}
          {renderElementTask()}
          {renderMultiInstance()}
          {renderElementListener()}
          {renderElementListenerOfTask()}
          {renderExtensionProperties()}
          {renderElementOtherInfo()}
        </Collapse>
      </Space>
    </>
  );
}