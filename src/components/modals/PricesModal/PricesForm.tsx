import { EditOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Collapse,
	Divider,
	Row,
	Select,
	Space,
	Tag,
	Tooltip,
} from 'antd';
import { FieldError, FormattedInputNumber, Label } from 'components/elements';
import { filterOption } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import { markdownTypes } from 'global';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { formatInPeso, getId } from 'utils';
import * as Yup from 'yup';

interface Props {
	branches: any;
	branchProducts?: any;
	product?: any;
	onSubmit: any;
	onClose: any;
	isLoading: boolean;
	isSubmitting: boolean;
	isBulkEdit?: boolean;
}

const variableNames = [
	{
		valueKey: 'markdownType',
		initialValueKey: 'initialMarkdownType',
	},
	{
		valueKey: 'costPerPiece',
		initialValueKey: 'initialCostPerPiece',
	},
	{
		valueKey: 'costPerBulk',
		initialValueKey: 'initialCostPerBulk',
	},
	{
		valueKey: 'pricePerPiece',
		initialValueKey: 'initialPricePerPiece',
	},
	{
		valueKey: 'pricePerBulk',
		initialValueKey: 'initialPricePerBulk',
	},
	{
		valueKey: 'wholeSalePrice',
		initialValueKey: 'initialWholeSalePrice',
	},
	{
		valueKey: 'specialPrice',
		initialValueKey: 'initialSpecialPrice',
	},
	{
		valueKey: 'creditPrice',
		initialValueKey: 'initialCreditPrice',
	},
];

export const PricesForm = ({
	branches,
	branchProducts,
	product,
	onSubmit,
	onClose,
	isLoading,
	isSubmitting,
	isBulkEdit,
}: Props) => {
	// STATES
	const [activeKey, setActiveKey] = useState(null);

	// METHODS
	useEffect(() => {
		if (branchProducts?.length === 1) {
			setActiveKey([branchProducts[0].branch_id]);
		}
	}, [branchProducts]);

	useEffect(() => {
		if (isBulkEdit) {
			setActiveKey(branches.map((branch) => getId(branch)).join(','));
		}
	}, [branches, isBulkEdit]);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: isBulkEdit
				? [
						{
							branchId: branches.map((branch) => getId(branch)).join(','),
							branchName: 'All Branches',

							markdownType: markdownTypes.REGULAR,
							costPerPiece: '',
							costPerBulk: '',
							pricePerPiece: '',
							pricePerBulk: '',

							wholeSalePrice: '',
							specialPrice: '',
							creditPrice: '',

							initialMarkdownType: markdownTypes.REGULAR,
							initialCostPerPiece: '',
							initialCostPerBulk: '',
							initialPricePerPiece: '',
							initialPricePerBulk: '',
							initialWholeSalePrice: '',
							initialSpecialPrice: '',
							initialCreditPrice: '',

							initialCreditPriceDifference: 0,
						},
				  ]
				: branchProducts.map((branchProduct) => {
						const branch = getBranch(branchProduct?.branch_id);

						return {
							branchId: getId(branch),
							branchName: branch?.name,

							markdownType:
								branchProduct?.price_markdown?.type || markdownTypes.REGULAR,
							costPerPiece: branchProduct?.cost_per_piece || '',
							costPerBulk: branchProduct?.cost_per_bulk || '',
							pricePerPiece: branchProduct?.price_per_piece || '',
							pricePerBulk: branchProduct?.price_per_bulk || '',
							wholeSalePrice: branchProduct?.wholesale_price || '',
							specialPrice: branchProduct?.special_price || '',
							creditPrice: branchProduct?.credit_price || '',

							initialMarkdownType:
								branchProduct?.price_markdown?.type || markdownTypes.REGULAR,
							initialCostPerPiece: branchProduct?.cost_per_piece || '',
							initialCostPerBulk: branchProduct?.cost_per_bulk || '',
							initialPricePerPiece: branchProduct?.price_per_piece || '',
							initialPricePerBulk: branchProduct?.price_per_bulk || '',
							initialWholeSalePrice: branchProduct?.wholesale_price || '',
							initialSpecialPrice: branchProduct?.special_price || '',
							initialCreditPrice: branchProduct?.credit_price || '',

							// NOTE: UI changes only
							initialCreditPriceDifference:
								Number(branchProduct?.price_per_piece) -
								Number(branchProduct?.credit_price),
						};
				  }),
			Schema: Yup.array(
				Yup.object().shape({
					markdownType: Yup.string().label('Current Sales Price Type'),
					costPerPiece: Yup.number().min(0).label('Cost (Piece)'),
					costPerBulk: Yup.number().min(0).label('Cost (Bulk)'),
					pricePerPiece: Yup.number().min(0).label('Regular Price (Piece)'),
					pricePerBulk: Yup.number().min(0).label('Regular Price (Bulk)'),
					wholeSalePrice: Yup.number().min(0).label('Wholesale Price'),
					specialPrice: Yup.number().min(0).label('Special Price'),
					creditPrice: Yup.number().min(0).label('Credit Price'),
				}),
			),
		}),
		[branchProducts, branches],
	);

	const renderInputField = ({
		name,
		label,
		value,
		placeholder,
		setFieldValue,
	}) => (
		<>
			<Label id={name} label={label} spacing />
			<FormattedInputNumber
				className="w-100"
				controls={false}
				placeholder={placeholder ? Number(placeholder).toFixed(2) : undefined}
				value={value}
				onChange={(newValue) => {
					setFieldValue(name, newValue);
				}}
			/>
			<ErrorMessage
				name={name}
				render={(error) => <FieldError error={error} />}
			/>
		</>
	);

	const isEdited = (branchProduct) =>
		variableNames.some(
			(variable) =>
				branchProduct[variable.initialValueKey] !==
				branchProduct[variable.valueKey],
		);

	const getBranch = useCallback(
		(branchId) => branches.find(({ id }) => id === branchId),
		[branches],
	);

	// NOTE: COMMENTED OUT FIELD FORMS ARE REMOVED FIELD FORMS

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={(values) => {
				const ALLOWED_LENGTH = 1;

				let priceMarkdownFormData = [];
				if (
					isBulkEdit &&
					values[0].initialMarkdownType !== values[0].markdownType
				) {
					const newMarkdownType = values[0].markdownType;
					priceMarkdownFormData = branches.map((branch) => {
						const data = {
							branchId: getId(branch),
							type: newMarkdownType,
						};

						return data;
					});
				} else if (!isBulkEdit) {
					priceMarkdownFormData = values
						.map((value) => {
							const data = { branchId: value.branchId };

							if (value.initialMarkdownType !== value.markdownType) {
								data['type'] = value.markdownType;
							}

							return data;
						})
						.filter((data) => Object.keys(data).length > ALLOWED_LENGTH);
				}

				const branchProductFormData = values
					.map((value) => {
						const data = { branchIds: _.toString(value.branchId) };

						variableNames.forEach((variable) => {
							if (
								value[variable.initialValueKey] !== value[variable.valueKey]
							) {
								data[variable.valueKey] = value[variable.valueKey];
							}
						});

						return data;
					})
					.filter((data) => Object.keys(data).length > ALLOWED_LENGTH);

				onSubmit({
					branchProductFormData,
					priceMarkdownFormData,
					isBulkEdit,
				});
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					{values.length > 0 && (
						<Collapse
							activeKey={activeKey}
							collapsible={
								isBulkEdit || values.length === 1 ? 'disabled' : undefined
							}
							expandIconPosition="right"
							onChange={(key) => {
								setActiveKey(key);
							}}
						>
							{values.map((branchProduct, index) => (
								<Collapse.Panel
									key={branchProduct.branchId}
									header={
										<Row className="w-100" justify="space-between">
											<Col>{branchProduct.branchName}</Col>
											{isEdited(branchProduct) && (
												<Col>
													<Tag color="blue" icon={<EditOutlined />}>
														Edited
													</Tag>
												</Col>
											)}
										</Row>
									}
								>
									<Row gutter={[16, 16]}>
										<Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.costPerPiece`,
												label: 'Cost',
												placeholder:
													product?.cost_per_piece ||
													branchProduct.initialCostPerPiece,
												value: branchProduct.costPerPiece,
												setFieldValue,
											})}
										</Col>
										{/* <Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.costPerBulk`,
												label: 'Cost (Bulk)',
												placeholder:
													product?.cost_per_bulk ||
													branchProduct.initialCostPerBulk,
												value: branchProduct.costPerBulk,
												setFieldValue,
											})}
										</Col> */}

										<Col span={24}>
											<Divider className="my-0" />
										</Col>

										<Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.pricePerPiece`,
												label: 'Regular Price',
												placeholder:
													product?.price_per_piece ||
													branchProduct.initialPricePerPiece,
												value: branchProduct.pricePerPiece,
												setFieldValue: (name, newValue) => {
													setFieldValue(name, newValue);
													// setFieldValue(
													// 	`${index}.creditPrice`,
													// 	Number(newValue) +
													// 		branchProduct.initialCreditPriceDifference,
													// );
													// setFieldValue(
													// 	`${index}.governmentCreditPricePerPiece`,
													// 	Number(newValue) +
													// 		branchProduct.initialGovernmentCreditPricePerPieceDifference,
													// );
												},
											})}
										</Col>
										{/* <Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.pricePerBulk`,
												label: 'Regular Price (Bulk)',
												placeholder:
													product?.price_per_bulk ||
													branchProduct.initialPricePerBulk,
												value: branchProduct.pricePerBulk,
												setFieldValue: (name, newValue) => {
													setFieldValue(name, newValue);
													// setFieldValue(
													// 	`${index}.creditPricePerBulk`,
													// 	Number(newValue) +
													// 		branchProduct.initialCreditPricePerBulkDifference,
													// );
													// setFieldValue(
													// 	`${index}.governmentCreditPricePerBulk`,
													// 	Number(newValue) +
													// 		branchProduct.initialGovernmentCreditPricePerBulkDifference,
													// );
												},
											})}
										</Col> */}

										<Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.wholeSalePrice`,
												label: 'Wholesale Price',
												placeholder:
													branchProduct.initialWholeSalePrice ||
													product?.wholesale_price,
												value: branchProduct.wholeSalePrice,
												setFieldValue,
											})}
										</Col>
										{/* <Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.markdownPricePerBulk1`,
												label: 'Wholesale Price (Bulk)',
												placeholder:
													product?.wholesale_price ||
													branchProduct.initialMarkdownPricePerBulk1,
												value: branchProduct.markdownPricePerBulk1,
												setFieldValue,
											})}
										</Col> */}

										<Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.specialPrice`,
												label: 'Special Price',
												placeholder:
													branchProduct.initialSpecialPrice ||
													product?.special_price,
												value: branchProduct.specialPrice,
												setFieldValue,
											})}
										</Col>
										{/* <Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.markdownPricePerBulk2`,
												label: 'Special Price (Bulk)',
												placeholder:
													product?.special_price ||
													branchProduct.initialMarkdownPricePerBulk2,
												value: branchProduct.markdownPricePerBulk2,
												setFieldValue,
											})}
										</Col> */}

										<Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.creditPrice`,
												label: (
													<Space>
														<span>Credit Price</span>
														<Tooltip title="Difference between credit price and regular price">
															<Tag color="blue">
																{formatInPeso(
																	branchProduct.initialCreditPriceDifference,
																)}
															</Tag>
														</Tooltip>
													</Space>
												),
												placeholder:
													branchProduct.CreditPrice || product?.credit_price,
												value: branchProduct.creditPrice,
												setFieldValue,
											})}
										</Col>

										<Col sm={12} span={24}>
											{renderInputField({
												name: 'poPrice',
												label: 'PO Price',
												setFieldValue,
												placeholder:
													branchProduct.CreditPrice || product?.credit_price,
												value: branchProduct.creditPrice,
											})}
										</Col>
										{/* <Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.creditPricePerBulk`,
												label: (
													<Space>
														<span>Credit Price (Bulk)</span>
														<Tooltip title="Difference between credit price and regular price">
															<Tag color="blue">
																{formatInPeso(
																	branchProduct.initialCreditPricePerBulkDifference,
																)}
															</Tag>
														</Tooltip>
													</Space>
												),
												placeholder:
													product?.credit_price ||
													branchProduct.initialCreditPricePerBulk,
												value: branchProduct.creditPricePerBulk,
												setFieldValue,
											})}
										</Col> */}

										{/* <Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.governmentCreditPricePerPiece`,
												label: (
													<Space>
														<span>Government Credit Price (Piece)</span>
														<Tooltip title="Difference between credit price and regular price">
															<Tag color="blue">
																{formatInPeso(
																	branchProduct.initialGovernmentCreditPricePerPieceDifference,
																)}
															</Tag>
														</Tooltip>
													</Space>
												),
												placeholder:
													branchProduct.initialGovernmentCreditPricePerPiece,
												value: branchProduct.governmentCreditPricePerPiece,
												setFieldValue,
											})}
										</Col> */}
										{/* <Col sm={12} span={24}>
											{renderInputField({
												name: `${index}.governmentCreditPricePerBulk`,
												label: (
													<Space>
														<span>Government Credit Price (Bulk)</span>
														<Tooltip title="Difference between credit price and regular price">
															<Tag color="blue">
																{formatInPeso(
																	branchProduct.initialGovernmentCreditPricePerBulkDifference,
																)}
															</Tag>
														</Tooltip>
													</Space>
												),
												placeholder:
													branchProduct.initialGovernmentCreditPricePerBulk,
												value: branchProduct.governmentCreditPricePerBulk,
												setFieldValue,
											})}
										</Col> */}

										<Col span={24}>
											<Divider className="my-0" />
										</Col>

										<Col span={24}>
											<Label
												id="markdownType"
												label="Current Sales Price Type"
												spacing
											/>
											<Select
												className="w-100"
												filterOption={filterOption}
												optionFilterProp="children"
												value={branchProduct.markdownType}
												showSearch
												onChange={(value) => {
													setFieldValue(`${index}.markdownType`, value);
												}}
											>
												<Select.Option
													key={markdownTypes.REGULAR}
													value={markdownTypes.REGULAR}
												>
													Regular
												</Select.Option>
												<Select.Option
													key={markdownTypes.WHOLESALE}
													value={markdownTypes.WHOLESALE}
												>
													Wholesale
												</Select.Option>
												<Select.Option
													key={markdownTypes.SPECIAL}
													value={markdownTypes.SPECIAL}
												>
													Special
												</Select.Option>
											</Select>

											<ErrorMessage
												name="markdownType"
												render={(error) => <FieldError error={error} />}
											/>
										</Col>
									</Row>
								</Collapse.Panel>
							))}
						</Collapse>
					)}

					<div className="ModalCustomFooter">
						<Button
							disabled={isLoading || isSubmitting}
							htmlType="button"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button
							disabled={isLoading || isSubmitting}
							htmlType="submit"
							loading={isSubmitting}
							type="primary"
						>
							Submit
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
