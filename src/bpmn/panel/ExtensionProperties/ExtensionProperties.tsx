import React, { useEffect, useRef, useState } from 'react';
import { Button, notification, Space, Table } from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import EditProperty from '@/bpmn/panel/ExtensionProperties/EditProperty/EditProperty';
import {
  createProperties,
  createProperty,
  extractExtensionList,
  extractOtherExtensionList,
  updateElementExtensions,
} from '@/util/panelUtil';
import { useAppSelector } from '@/redux/hook/hooks';

interface IProps {
  businessObject: any;
}

/**
 * 扩展属性 组件
 *
 * @param props
 * @constructor
 */
export default function ExtensionProperties(props: IProps) {
  // props
  const { businessObject } = props;
  // state
  const [dataSource, setDataSource] = useState<Array<any>>([]);
  const [propertyList, setPropertyList] = useState<Array<any>>([]);
  // ref
  const modalRef = useRef<any>();
  // redux
  const prefix = useAppSelector((state) => state.bpmn.prefix);

  /**
   * 初始化
   */
  useEffect(() => {
    if (businessObject) {
      initPageData();
    }
  }, [businessObject?.id]);

  /**
   * 初始化页面数据
   */
  function initPageData() {
    initRows();
  }

  /**
   * 初始化表格行数据
   */
  function initRows() {
    let businessObject =
      window.bpmnInstance?.element?.businessObject || props.businessObject;
    if (!businessObject) {
      return;
    }
    // 获取扩展属性
    let properties: any[] = extractExtensionList(prefix, 'Properties');
    setPropertyList(properties);
    // 初始化行数据源
    let rows: any[] =
      properties?.map((e, i) => {
        return {
          key: i + 1,
          name: e.name,
          value: e.value,
        };
      }) || [];
    setDataSource(rows);
  }

  /**
   * 获取其它属性
   */
  function getOtherExtensionList() {
    return extractOtherExtensionList(prefix, 'Properties');
  }

  // todo 修改到这里
  function createOrUpdate(options: any) {
    const { rowKey, propertyName, propertyValue } = options;
    // 创建属性实例
    let property: any = createProperty(prefix, {
      name: propertyName,
      value: propertyValue,
    });
    // 创建扩展属性列表实例
    let newProperties: Array<any> = [...propertyList];
    newProperties.splice(
      rowKey > 0 ? rowKey - 1 : propertyList.length,
      1,
      property,
    );
    let properties: any = createProperties(prefix, {
      properties: newProperties,
    });
    // 更新扩展属性
    updateElementExtensions(getOtherExtensionList().concat([properties]));
    // 刷新表格
    initRows();
  }

  function remove(rowKey: number) {
    // 创建扩展属性列表实例
    let newProperties: Array<any> = [...propertyList];
    newProperties.splice(rowKey - 1, 1);
    let properties: any = createProperties(prefix, {
      properties: newProperties,
    });
    // 更新扩展属性
    updateElementExtensions(getOtherExtensionList().concat([properties]));
    // 刷新表格
    initRows();
    // 提示通知
    notification.open({
      message: <span style={{ color: 'red' }}>属性已删除</span>,
      placement: 'top',
      duration: 2,
      description: `已删除编号为 ${rowKey} 的监听器`,
    });
  }

  // 列
  const columns = [
    {
      title: '序号',
      width: 40,
      dataIndex: 'key',
      key: 'key',
      render: (text: any) => <a>{text}</a>,
    },
    {
      title: '属性名',
      width: 110,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '属性值',
      width: 110,
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 80,
      key: 'action',
      render: (text: string, record: any) => (
        <Space size={1}>
          <Button
            type="text"
            size={'small'}
            style={{ color: '#1890ff' }}
            onClick={() => {
              modalRef.current.showEditModal(record);
            }}
          >
            {'编辑'}
          </Button>
          <Button
            danger
            type="text"
            size={'small'}
            onClick={() => {
              remove(record.key);
            }}
          >
            {'删除'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        size={'small'}
        locale={{
          emptyText: (
            <div style={{ margin: 20 }}>
              <InboxOutlined style={{ fontSize: '50px' }} />
              <div>{'暂无'}</div>
            </div>
          ),
        }}
      />
      <Button
        type="primary"
        style={{
          width: '100%',
          marginTop: 8,
        }}
        onClick={() => {
          modalRef.current.showEditModal();
        }}
      >
        <PlusOutlined />
        <span style={{ marginLeft: 0 }}>添加属性</span>
      </Button>
      <EditProperty onRef={modalRef} createOrUpdate={createOrUpdate} />
    </>
  );
}
