import { Button, Col, Input, Modal, Row, Select } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { filterOption, getFullName, ServiceType, useUsers } from 'ejjy-global';
import React from 'react';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import shallow from 'zustand/shallow';
import { MAX_PAGE_SIZE } from 'global';
import { getId, getLocalApiUrl, isStandAlone } from 'utils';
import { FieldError, Label } from '../../elements';

type ModalProps = {
	isLoading: boolean;
	onSubmit: (formData) => void;
	onClose: () => void;
};

const formDetails = {
	defaultValues: {
		preparedBy: null,
		approvedBy: null,
	},
	schema: Yup.object().shape({
		preparedBy: Yup.number().nullable().required().label('Prepared By'),
		approvedBy: Yup.number().nullable().required().label('Approved By'),
	}),
};

export const CreateRequisitionSlipModal = ({
	isLoading,
	onSubmit,
	onClose,
}: ModalProps) => {
	// CUSTOM HOOKS
	const { data: usersData, isFetching: isFetchingUsers } = useUsers({
		params: { pageSize: MAX_PAGE_SIZE },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	const { resetProducts } = useBoundStore(
		(state: any) => ({
			resetProducts: state.resetProducts,
		}),
		shallow,
	);

	return (
		<Modal
			footer={null}
			title="Create Requisition Slip"
			closable
			destroyOnClose
			open
			onCancel={() => {
				onClose();
				resetProducts();
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
				{({ values, setFieldValue }) => (
					<Form>
						<Row gutter={[16, 16]}>
							<Col span={24}>
								<Label id="preparedBy" label="Prepared By" spacing />
								<Select
									className="w-100"
									disabled={isFetchingUsers}
									filterOption={filterOption}
									optionFilterProp="children"
									value={values['preparedBy']}
									showSearch
									onChange={(value) => {
										setFieldValue('preparedBy', value);
									}}
								>
									{usersData?.list.map((user) => {
										const id = getId(user);
										return id ? (
											<Select.Option key={id} value={id}>
												{getFullName(user)}
											</Select.Option>
										) : null;
									})}
								</Select>
								<ErrorMessage
									name="preparedBy"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>

							<Col span={24}>
								<Label id="approvedBy" label="Approved By" spacing />
								<Select
									className="w-100"
									disabled={isFetchingUsers}
									filterOption={filterOption}
									optionFilterProp="children"
									value={values['approvedBy']}
									showSearch
									onChange={(value) => {
										setFieldValue('approvedBy', value);
									}}
								>
									{usersData?.list.map((user) => {
										const id = getId(user);
										return id ? (
											<Select.Option key={id} value={id}>
												{getFullName(user)}
											</Select.Option>
										) : null;
									})}
								</Select>
								<ErrorMessage
									name="approvedBy"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>
						</Row>

						<div className="ModalCustomFooter">
							<Button disabled={isLoading} htmlType="button" onClick={onClose}>
								Cancel
							</Button>
							<Button htmlType="submit" loading={isLoading} type="primary">
								Submit
							</Button>
						</div>
					</Form>
				)}
			</Formik>
		</Modal>
	);
};
