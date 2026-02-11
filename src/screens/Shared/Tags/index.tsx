import React, { useState } from 'react';
import { Button, Form, Input, Modal, Table, Tabs } from 'antd';
import _ from 'lodash';
import { Content, TableHeader } from 'components';
import { Box } from 'components/elements';
import { ProductCategoriesTab } from './components/ProductCategoriesTab';
import { PointSystemTagsTab } from './components/PointSystemTagsTab';
import { ProductGroupsTab } from './components/ProductGroupsTab';

type Props = {
	basePath: string;
};

const tabs = {
	PRODUCT_CATEGORIES: 'Product Categories',
	POINT_SYSTEM_TAGS: 'Point System Tags',
	PRODUCT_GROUPS: 'Product Groups',
	PRODUCT_TYPE: 'Product Type',
	STORAGE_TYPE: 'Storage Type',
	PRODUCT_LOCATION: 'Product Location',
	BRAND_NAME: 'Brand Name',
};

export const Tags = ({ basePath }: Props) => {
	const [tab, setTab] = useState(tabs.PRODUCT_CATEGORIES);
	const allowCreate = basePath === '/office-manager';

	type NameRow = {
		key: string;
		name: string;
	};

	const [productTypeRows, setProductTypeRows] = useState<NameRow[]>([]);
	const [storageTypeRows, setStorageTypeRows] = useState<NameRow[]>([]);
	const [productLocationRows, setProductLocationRows] = useState<NameRow[]>([]);
	const [brandNameRows, setBrandNameRows] = useState<NameRow[]>([]);

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

					<Tabs.TabPane
						key={tabs.POINT_SYSTEM_TAGS}
						tab={tabs.POINT_SYSTEM_TAGS}
					>
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
								/>
							)}

							<Table
								columns={nameColumns}
								dataSource={productTypeRows}
								pagination={false}
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

											setProductTypeRows((prev) => [
												...prev,
												{ key: `${Date.now()}-${Math.random()}`, name },
											]);
											setProductTypeVisible(false);
											productTypeForm.resetFields();
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
								/>
							)}

							<Table
								columns={nameColumns}
								dataSource={storageTypeRows}
								pagination={false}
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

											setStorageTypeRows((prev) => [
												...prev,
												{ key: `${Date.now()}-${Math.random()}`, name },
											]);
											setStorageTypeVisible(false);
											storageTypeForm.resetFields();
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
								/>
							)}

							<Table
								columns={nameColumns}
								dataSource={productLocationRows}
								pagination={false}
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

											setProductLocationRows((prev) => [
												...prev,
												{ key: `${Date.now()}-${Math.random()}`, name },
											]);
											setProductLocationVisible(false);
											productLocationForm.resetFields();
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
								/>
							)}

							<Table
								columns={nameColumns}
								dataSource={brandNameRows}
								pagination={false}
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

											setBrandNameRows((prev) => [
												...prev,
												{ key: `${Date.now()}-${Math.random()}`, name },
											]);
											setBrandNameVisible(false);
											brandNameForm.resetFields();
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
