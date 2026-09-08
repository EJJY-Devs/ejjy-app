import { Button, Col, Modal, Row, Select, Input } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import * as Yup from 'yup';
import {
	filterOption,
	getFullName,
	ServiceType,
	useBranches,
} from 'ejjy-global';
import React from 'react';

import { useSupplierRegistrations } from 'hooks';
import { MAX_PAGE_SIZE } from 'global';
import { getLocalApiUrl, getLocalBranchId } from 'utils';
import { FieldError, Label } from '../../elements';

type ModalProps = {
	isLoading: boolean;
	onSubmit: (formData) => void;
	onClose: () => void;
};

const VENDOR_TYPES = {
	BRANCH: 'branch',
	SUPPLIER: 'supplier',
};

const formDetails = {
	defaultValues: {
		approvedBy: null,
		vendorType: VENDOR_TYPES.BRANCH,
		vendorId: null,
		supplierId: null,
		overallRemarks: null,
	},
	schema: Yup.object().shape({
		vendorType: Yup.string().required().label('Vendor Type'),
		vendorId: Yup.number()
			.nullable()
			.when('vendorType', {
				is: VENDOR_TYPES.BRANCH,
				then: Yup.number().nullable().required().label('Branch'),
			})
			.label('Branch'),
		supplierId: Yup.number()
			.nullable()
			.when('vendorType', {
				is: VENDOR_TYPES.SUPPLIER,
				then: Yup.number().nullable().required().label('Supplier'),
			})
			.label('Supplier'),
		overallRemarks: Yup.string().nullable().label('Remarks'),
	}),
};

export const CreateRequisitionSlipModal = ({
	isLoading,
	onSubmit,
	onClose,
}: ModalProps) => {
	// CUSTOM HOOKS
	const { data: branchesData, isFetching: isFetchingBranches } = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: ServiceType.ONLINE,
		},
	});
	const {
		data: { supplierRegistrations },
		isFetching: isFetchingSuppliers,
	} = useSupplierRegistrations({
		params: { pageSize: MAX_PAGE_SIZE, isActive: true },
	});

	return (
		<Modal
			footer={null}
			title="Create Requisition Slip"
			closable
			destroyOnClose
			open
			onCancel={() => {
				onClose();
			}}
		>
			<Formik
				initialValues={formDetails.defaultValues}
				validationSchema={formDetails.schema}
				onSubmit={(formData) => {
					onSubmit(formData);
					onClose();
				}}
			>
				{({ values, setFieldValue }) => {
					const handleVendorTypeChange = (value: string) => {
						setFieldValue('vendorType', value);
						// Reset the vendor selection when switching types so
						// we never submit a stale branch/supplier id.
						setFieldValue('vendorId', null);
						setFieldValue('supplierId', null);
					};

					return (
						<Form>
							<div className="d-flex justify-end mb-4">
								<Button.Group>
									<Button
										type={
											values['vendorType'] === VENDOR_TYPES.BRANCH
												? 'primary'
												: 'default'
										}
										onClick={() => handleVendorTypeChange(VENDOR_TYPES.BRANCH)}
									>
										Branch
									</Button>
									<Button
										type={
											values['vendorType'] === VENDOR_TYPES.SUPPLIER
												? 'primary'
												: 'default'
										}
										onClick={() =>
											handleVendorTypeChange(VENDOR_TYPES.SUPPLIER)
										}
									>
										Supplier
									</Button>
								</Button.Group>
							</div>

							<Row gutter={[16, 16]}>
								{values['vendorType'] === VENDOR_TYPES.BRANCH ? (
									<Col span={24}>
										<Label id="vendorId" label="Branch" spacing />
										<Select
											className="w-100"
											disabled={isFetchingBranches}
											filterOption={filterOption}
											optionFilterProp="children"
											value={values['vendorId']}
											showSearch
											onChange={(value) => {
												setFieldValue('vendorId', value);
											}}
										>
											{branchesData?.list
												.filter(
													(branch) => branch?.id !== Number(getLocalBranchId()),
												)
												.map((branch) => {
													const id = branch?.id;
													return id ? (
														<Select.Option key={id} value={id}>
															{branch.name}
														</Select.Option>
													) : null;
												})}
										</Select>
										<ErrorMessage
											name="vendorId"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
								) : (
									<Col span={24}>
										<Label id="supplierId" label="Supplier" spacing />
										<Select
											className="w-100"
											disabled={isFetchingSuppliers}
											filterOption={filterOption}
											optionFilterProp="children"
											value={values['supplierId']}
											showSearch
											onChange={(value) => {
												setFieldValue('supplierId', value);
											}}
										>
											{supplierRegistrations?.map((supplier) => {
												const id = supplier?.id;
												return id ? (
													<Select.Option key={id} value={id}>
														{getFullName(supplier.account)}
													</Select.Option>
												) : null;
											})}
										</Select>
										<ErrorMessage
											name="supplierId"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
								)}

								<Col span={24}>
									<Label label="Remarks" spacing />
									<Input
										name="overallRemarks"
										value={values['overallRemarks']}
										onChange={(e) => {
											setFieldValue('overallRemarks', e.target.value);
										}}
									/>
									<ErrorMessage
										name="overallRemarks"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
							</Row>

							<div className="ModalCustomFooter">
								<Button
									disabled={isLoading}
									htmlType="button"
									onClick={onClose}
								>
									Cancel
								</Button>
								<Button htmlType="submit" loading={isLoading} type="primary">
									Submit
								</Button>
							</div>
						</Form>
					);
				}}
			</Formik>
		</Modal>
	);
};
