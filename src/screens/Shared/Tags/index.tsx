import React, { useState } from 'react';
import { Button, Form, Input, message, Modal, Table, Tabs } from 'antd';
import _ from 'lodash';
import { Content, TableHeader } from 'components';
import { Box } from 'components/elements';
import { MAX_PAGE_SIZE } from 'global';
import {
	useBrandNameCreate,
	useBrandNames,
	usePingOnlineServer,
	useProductLocationCreate,
	useProductLocations,
	useProductTypeCreate,
	useProductTypes,
	useStorageTypeCreate,
	useStorageTypes,
} from 'hooks';
import { ProductCategoriesTab } from './components/ProductCategoriesTab';
import { PointSystemTagsTab } from './components/PointSystemTagsTab';
import { ProductGroupsTab } from './components/ProductGroupsTab';

type Props = {
	basePath: string;
};

const tabs = {
	PRODUCT_CATEGORIES: 'Product Categories',
	PATRONAGE_SYSTEM: 'Patronage System',
	PRODUCT_GROUPS: 'Product Groups',
	PRODUCT_TYPE: 'Product Type',
	STORAGE_TYPE: 'Storage Type',
	PRODUCT_LOCATION: 'Product Location',
	BRAND_NAME: 'Brand Name',
};

export const Tags = ({ basePath }: Props) => {
	const [tab, setTab] = useState(tabs.PRODUCT_CATEGORIES);
	const allowCreate = basePath === '/office-manager';
	const { isConnected } = usePingOnlineServer();

	const {
		data: { productTypes } = { productTypes: [] },
		isFetching: isFetchingProductTypes,
	} = useProductTypes({ params: { pageSize: MAX_PAGE_SIZE } });
	const {
		data: { storageTypes } = { storageTypes: [] },
		isFetching: isFetchingStorageTypes,
	} = useStorageTypes({ params: { pageSize: MAX_PAGE_SIZE } });
	const {
		data: { productLocations } = { productLocations: [] },
		isFetching: isFetchingProductLocations,
	} = useProductLocations({ params: { pageSize: MAX_PAGE_SIZE } });
	const {
		data: { brandNames } = { brandNames: [] },
		isFetching: isFetchingBrandNames,
	} = useBrandNames({ params: { pageSize: MAX_PAGE_SIZE } });

	const {
		mutate: createProductType,
		isLoading: isCreatingProductType,
	} = useProductTypeCreate();
	const {
		mutate: createStorageType,
		isLoading: isCreatingStorageType,
	} = useStorageTypeCreate();
	const {
		mutate: createProductLocation,
		isLoading: isCreatingProductLocation,
	} = useProductLocationCreate();
	const {
		mutate: createBrandName,
		isLoading: isCreatingBrandName,
	} = useBrandNameCreate();

	const [productTypeVisible, setProductTypeVisible] = useState(false);
	const [storageTypeVisible, setStorageTypeVisible] = useState(false);
	const [productLocationVisible, setProductLocationVisible] = useState(false);
	const [brandNameVisible, setBrandNameVisible] = useState(false);

	const [productTypeForm] = Form.useForm();
	const [storageTypeForm] = Form.useForm();
	const [productLocationForm] = Form.useForm();
	const [brandNameForm] = Form.useForm();

	const nameColumns = [{ title: 'Name', dataIndex: 'name' }];

	return (
		<Content title="Tags">
			<Box>
				<Tabs
					activeKey={_.toString(tab)}
					className="pa-6"
					type="card"
					destroyInactiveTabPane
					onTabClick={(selectedTab: string) => setTab(selectedTab)}
				>
					<Tabs.TabPane
						key={tabs.PRODUCT_CATEGORIES}
						tab={tabs.PRODUCT_CATEGORIES}
					>
						<ProductCategoriesTab />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.PATRONAGE_SYSTEM} tab={tabs.PATRONAGE_SYSTEM}>
						<PointSystemTagsTab />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.PRODUCT_GROUPS} tab={tabs.PRODUCT_GROUPS}>
						<ProductGroupsTab basePath={basePath} />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.PRODUCT_TYPE} tab={tabs.PRODUCT_TYPE}>
						<Box padding>
							{allowCreate && (
								<TableHeader
									buttonName="Create Product Type"
									onCreate={() => setProductTypeVisible(true)}
									onCreateDisabled={isConnected === false}
								/>
							)}

							<Table
								columns={nameColumns}
								dataSource={productTypes}
								loading={isFetchingProductTypes}
								pagination={false}
								rowKey="id"
								bordered
							/>

							{allowCreate && (
								<Modal
									footer={null}
									title="Create Product Type"
									visible={productTypeVisible}
									destroyOnClose
									onCancel={() => {
										setProductTypeVisible(false);
										productTypeForm.resetFields();
									}}
								>
									<Form
										form={productTypeForm}
										layout="vertical"
										onFinish={(values) => {
											const name = String(values?.name || '').trim();
											if (!name) return;

											createProductType(
												{ name },
												{
													onSuccess: () => {
														message.success(
															'Product type was created successfully',
														);
														setProductTypeVisible(false);
														productTypeForm.resetFields();
													},
												},
											);
										}}
									>
										<Form.Item
											label="Name"
											name="name"
											rules={[{ required: true, message: 'Name is required' }]}
										>
											<Input />
										</Form.Item>

										<div className="d-flex justify-end">
											<Button
												disabled={isConnected === false}
												loading={isCreatingProductType}
												type="primary"
												onClick={() => productTypeForm.submit()}
											>
												Create
											</Button>
										</div>
									</Form>
								</Modal>
							)}
						</Box>
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.STORAGE_TYPE} tab={tabs.STORAGE_TYPE}>
						<Box padding>
							{allowCreate && (
								<TableHeader
									buttonName="Create Storage Type"
									onCreate={() => setStorageTypeVisible(true)}
									onCreateDisabled={isConnected === false}
								/>
							)}

							<Table
								columns={nameColumns}
								dataSource={storageTypes}
								loading={isFetchingStorageTypes}
								pagination={false}
								rowKey="id"
								bordered
							/>

							{allowCreate && (
								<Modal
									footer={null}
									title="Create Storage Type"
									visible={storageTypeVisible}
									destroyOnClose
									onCancel={() => {
										setStorageTypeVisible(false);
										storageTypeForm.resetFields();
									}}
								>
									<Form
										form={storageTypeForm}
										layout="vertical"
										onFinish={(values) => {
											const name = String(values?.name || '').trim();
											if (!name) return;

											createStorageType(
												{ name },
												{
													onSuccess: () => {
														message.success(
															'Storage type was created successfully',
														);
														setStorageTypeVisible(false);
														storageTypeForm.resetFields();
													},
												},
											);
										}}
									>
										<Form.Item
											label="Name"
											name="name"
											rules={[{ required: true, message: 'Name is required' }]}
										>
											<Input />
										</Form.Item>

										<div className="d-flex justify-end">
											<Button
												disabled={isConnected === false}
												loading={isCreatingStorageType}
												type="primary"
												onClick={() => storageTypeForm.submit()}
											>
												Create
											</Button>
										</div>
									</Form>
								</Modal>
							)}
						</Box>
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.PRODUCT_LOCATION} tab={tabs.PRODUCT_LOCATION}>
						<Box padding>
							{allowCreate && (
								<TableHeader
									buttonName="Create Product Location"
									onCreate={() => setProductLocationVisible(true)}
									onCreateDisabled={isConnected === false}
								/>
							)}

							<Table
								columns={nameColumns}
								dataSource={productLocations}
								loading={isFetchingProductLocations}
								pagination={false}
								rowKey="id"
								bordered
							/>

							{allowCreate && (
								<Modal
									footer={null}
									title="Create Product Location"
									visible={productLocationVisible}
									destroyOnClose
									onCancel={() => {
										setProductLocationVisible(false);
										productLocationForm.resetFields();
									}}
								>
									<Form
										form={productLocationForm}
										layout="vertical"
										onFinish={(values) => {
											const name = String(values?.name || '').trim();
											if (!name) return;

											createProductLocation(
												{ name },
												{
													onSuccess: () => {
														message.success(
															'Product location was created successfully',
														);
														setProductLocationVisible(false);
														productLocationForm.resetFields();
													},
												},
											);
										}}
									>
										<Form.Item
											label="Name"
											name="name"
											rules={[{ required: true, message: 'Name is required' }]}
										>
											<Input />
										</Form.Item>

										<div className="d-flex justify-end">
											<Button
												disabled={isConnected === false}
												loading={isCreatingProductLocation}
												type="primary"
												onClick={() => productLocationForm.submit()}
											>
												Create
											</Button>
										</div>
									</Form>
								</Modal>
							)}
						</Box>
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.BRAND_NAME} tab={tabs.BRAND_NAME}>
						<Box padding>
							{allowCreate && (
								<TableHeader
									buttonName="Create Brand Name"
									onCreate={() => setBrandNameVisible(true)}
									onCreateDisabled={isConnected === false}
								/>
							)}

							<Table
								columns={nameColumns}
								dataSource={brandNames}
								loading={isFetchingBrandNames}
								pagination={false}
								rowKey="id"
								bordered
							/>

							{allowCreate && (
								<Modal
									footer={null}
									title="Create Brand Name"
									visible={brandNameVisible}
									destroyOnClose
									onCancel={() => {
										setBrandNameVisible(false);
										brandNameForm.resetFields();
									}}
								>
									<Form
										form={brandNameForm}
										layout="vertical"
										onFinish={(values) => {
											const name = String(values?.name || '').trim();
											if (!name) return;

											createBrandName(
												{ name },
												{
													onSuccess: () => {
														message.success(
															'Brand name was created successfully',
														);
														setBrandNameVisible(false);
														brandNameForm.resetFields();
													},
												},
											);
										}}
									>
										<Form.Item
											label="Name"
											name="name"
											rules={[{ required: true, message: 'Name is required' }]}
										>
											<Input />
										</Form.Item>

										<div className="d-flex justify-end">
											<Button
												disabled={isConnected === false}
												loading={isCreatingBrandName}
												type="primary"
												onClick={() => brandNameForm.submit()}
											>
												Create
											</Button>
										</div>
									</Form>
								</Modal>
							)}
						</Box>
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};

export default Tags;
