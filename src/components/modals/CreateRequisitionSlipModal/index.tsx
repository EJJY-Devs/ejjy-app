import { Button, Col, Modal, Row, Select, Input } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { filterOption, ServiceType, useBranches } from 'ejjy-global';
import React from 'react';

import { MAX_PAGE_SIZE } from 'global';
import { getLocalApiUrl, getLocalBranchId } from 'utils';
import { FieldError, Label } from '../../elements';

type ModalProps = {
	isLoading: boolean;
	onSubmit: (formData) => void;
	onClose: () => void;
};

const formDetails = {
	defaultValues: {
		approvedBy: null,
		vendorId: null,
		overallRemarks: null,
	},
	schema: Yup.object().shape({
		vendorId: Yup.number().nullable().required().label('Vendor'),
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
				{({ values, setFieldValue }) => (
					<Form>
						<Row gutter={[16, 16]}>
							<Col span={24}>
								<Label id="vendorId" label="Vendor" spacing />
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
