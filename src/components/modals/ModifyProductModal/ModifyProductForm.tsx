/* eslint-disable react/no-this-in-sfc */
import { Button, Col, Divider, Input, Row, Select, Typography } from 'antd';
import { ScrollToFieldError } from 'components';
import {
	FieldError,
	FieldWarning,
	FormInput,
	FormRadioButton,
	FormSelect,
	FormattedInputNumber,
	Label,
} from 'components/elements';
import { filterOption } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import {
	MAX_PAGE_SIZE,
	booleanOptions,
	checkingTypesOptions,
	inputTypes,
	productCheckingTypes,
	productTypes,
	unitOfMeasurementTypes,
} from 'global';
import { useProductCategories, useSiteSettings } from 'hooks';
import { isInteger } from 'lodash';
import React, { useCallback } from 'react';
import { formatQuantity, getId } from 'utils';
import * as Yup from 'yup';

const { Text } = Typography;

const productTypeOptions = [
	{
		id: productTypes.WET,
		label: 'Wet',
		value: productTypes.WET,
	},
	{
		id: productTypes.DRY,
		label: 'Dry',
		value: productTypes.DRY,
	},
];

const unitOfMeasurementOptions = [
	{
		id: unitOfMeasurementTypes.WEIGHING,
		label: 'Weighing',
		value: unitOfMeasurementTypes.WEIGHING,
	},
	{
		id: unitOfMeasurementTypes.NON_WEIGHING,
		label: 'Non-Weighing',
		value: unitOfMeasurementTypes.NON_WEIGHING,
	},
];

const inStockOptions = [
	{
		id: 'retain',
		label: 'Retain',
		value: 'true',
	},
	{
		id: 'decline',
		label: 'Decline',
		value: 'false',
	},
];

const isVatExemptedOptions = [
	{
		id: 'vat',
		label: 'VAT',
		value: 'false',
	},
	{
		id: 'vae',
		label: 'VAT-EXEMPT',
		value: 'true',
	},
];

interface Props {
	isLoading: boolean;
	onClose: any;
	onSubmit: any;
	pointSystemTags: any;
	product: any;
}

export const ModifyProductForm = ({
	isLoading,
	onClose,
	onSubmit,
	pointSystemTags,
	product,
}: Props) => {
	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettings();
	const {
		data: { productCategories },
	} = useProductCategories({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	// METHODS
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				allowableSpoilage: product?.allowable_spoilage || 0.1,
				barcode: product?.barcode || '',
				sellingBarcode: product?.selling_barcode || '',
				packingBarcode: product?.packing_barcode || '',
				description: product?.description || '',
				hasQuantityAllowance: product?.has_quantity_allowance || false,
				isShownInScaleList: product?.is_shown_in_scale_list || false,
				isDailyChecked: product?.is_daily_checked || false,
				isRandomlyChecked: product?.is_randomly_checked || 'Daily',
				isSoldInBranch: undefined,
				isVatExempted: (!!product?.is_vat_exempted).toString(),
				maxBalance: product?.max_balance
					? formatQuantity({
							unitOfMeasurement: product?.unit_of_measurement,
							quantity: product.max_balance,
					  })
					: '',
				name: product?.name || '',
				piecesInBulk: product?.pieces_in_bulk || 1,
				conversionAmount: product?.conversion_amount || 1,
				pointSystemTagId: getId(product?.point_system_tag),
				costPerBulk: product?.cost_per_bulk || 1,
				costPerPiece: product?.cost_per_piece || '',
				pricePerBulk: product?.price_per_bulk || 1,
				pricePerPiece: product?.price_per_piece || '',
				specialPrice: product?.special_price || '',
				creditPrice: product?.credit_price || '',
				wholeSalePrice: product?.wholesale_price || '',

				printDetails: product?.print_details || '',
				priceTagPrintDetails: product?.price_tag_print_details || '',
				productCategory: product?.product_category,
				reorderPoint: product?.reorder_point
					? formatQuantity({
							unitOfMeasurement: product.unit_of_measurement,
							quantity: product.reorder_point,
					  })
					: '',
				textcode: product?.textcode || '',
				type: product?.type || productTypes.WET,
				unitOfMeasurement:
					product?.unit_of_measurement || unitOfMeasurementTypes.NON_WEIGHING,
				sellingBarcodeUnitOfMeasurement:
					product?.selling_barcode_unit_of_measurement ||
					unitOfMeasurementTypes.WEIGHING,
				packingBarcodeUnitOfMeasurement:
					product?.packing_barcode_unit_of_measurement ||
					unitOfMeasurementTypes.NON_WEIGHING,
			},
			Schema: Yup.object().shape(
				{
					textcode: Yup.string().max(50),
					sellingBarcode: Yup.string()
						.max(50)
						.test(
							'barcode-selling-required-2',
							'Input either a Product Barcode or Scale Barcode',
							function test(value) {
								// NOTE: We need to use a no-named function so
								// we can use 'this' and access the other form field value.
								return value || this.parent.barcode;
							},
						)
						.label('Scale Barcode'),

					name: Yup.string().required().max(70).label('Name').trim(),
					type: Yup.string().label('TT-001'),
					unitOfMeasurement: Yup.string().label('TT-002'),
					productCategory: Yup.string().label('Product Category'),
					printDetails: Yup.string()
						.required()
						.label('Print Details (Receipt)')
						.trim(),
					priceTagPrintDetails: Yup.string()
						.required()
						.label('Print Details (Price Tag)')
						.trim(),
					reorderPoint: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.test(
							'is-whole-number',
							'Non-weighing items require whole number quantity.',
							function test(value) {
								// NOTE: We need to use a no-named function so
								// we can use 'this' and access the other form field value.
								const { unitOfMeasurement } = this.parent;
								return unitOfMeasurement === unitOfMeasurementTypes.NON_WEIGHING
									? isInteger(Number(value))
									: true;
							},
						)
						.label('Reorder Point'),
					maxBalance: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.test(
							'is-whole-number',
							'Non-weighing items require whole number quantity.',
							function test(value) {
								// NOTE: We need to use a no-named function so
								// we can use 'this' and access the other form field value.
								const { unitOfMeasurement } = this.parent;
								return unitOfMeasurement === unitOfMeasurementTypes.NON_WEIGHING
									? isInteger(Number(value))
									: true;
							},
						)
						.label('Max Balance'),
					costPerPiece: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Cost per Piece'),
					// costPerBulk: Yup.number()
					// 	.required()
					// 	.moreThan(0)
					// 	.nullable()
					// 	.label('Cost Per Bulk'),
					pricePerPiece: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Regular Price'),
					// pricePerBulk: Yup.number()
					// 	.required()
					// 	.moreThan(0)
					// 	.nullable()
					// 	.label('Regular Price (Bulk)'),
					creditPrice: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Credit Price'),
					wholeSalePrice: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Wholesale Price'),
					specialPrice: Yup.number()
						.required()
						.moreThan(0)
						.nullable()
						.label('Special Price'),
					pointSystemTagId: Yup.string().nullable().label('Point System Tag'),
				},
				[['barcode', 'textcode']],
			),
		}),
		[product, siteSettings],
	);

	const getProductCategoriesOptions = useCallback(
		() =>
			productCategories.map(({ name }) => ({
				name,
				value: name,
			})),
		[productCategories],
	);

	const renderInputField = ({
		name,
		label,
		type = inputTypes.TEXT,
		values,
		setFieldValue,
		options = {},
	}) => (
		<>
			<Label id={name} label={label} spacing />
			{[inputTypes.TEXT, inputTypes.NUMBER].includes(type) && (
				<Input
					name={name}
					type={type}
					value={values[name]}
					onChange={(e) => {
						setFieldValue(name, e.target.value);
					}}
					{...options}
				/>
			)}
			{type === inputTypes.TEXTAREA && (
				<Input.TextArea
					name={name}
					value={values[name]}
					onChange={(e) => {
						setFieldValue(name, e.target.value);
					}}
					{...options}
				/>
			)}
			{type === inputTypes.MONEY && (
				<FormattedInputNumber
					className="w-100"
					controls={false}
					value={values[name]}
					onChange={(value) => {
						setFieldValue(name, value);
					}}
					{...options}
				/>
			)}
			<ErrorMessage
				name={name}
				render={(error) => <FieldError error={error} />}
			/>
		</>
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={async (formData) => {
				const data = {
					...formData,
				};

				onSubmit(data);
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<ScrollToFieldError />

					<Row gutter={[16, 16]}>
						<Col sm={12} span={24}>
							{renderInputField({
								name: 'sellingBarcode',
								label: 'Scale Barcode',
								setFieldValue,
								values,
								options: {
									disabled:
										values.unitOfMeasurement ===
										unitOfMeasurementTypes.WEIGHING,
								},
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'textcode',
								label: 'Textcode',
								setFieldValue,
								values,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'name',
								label: 'Name',
								setFieldValue,
								values,
							})}
						</Col>

						<Col sm={12} span={24}>
							<Label label="&nbsp;" spacing />
							<FormRadioButton
								id="sellingBarcodeUnitOfMeasurement"
								items={unitOfMeasurementOptions}
							/>
							<ErrorMessage
								name="sellingBarcodeUnitOfMeasurement"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'printDetails',
								label: 'Print Details (Receipt)',
								setFieldValue,
								values,
							})}
						</Col>

						<Col sm={12} span={24}>
							<Label label="Include In Scale" spacing />
							<FormRadioButton id="isShownInScaleList" items={booleanOptions} />
							<ErrorMessage
								name="isShownInScaleList"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'priceTagPrintDetails',
								label: 'Print Details (Price Tag)',
								setFieldValue,
								values,
								type: inputTypes.TEXTAREA,
								options: {
									autoSize: { minRows: 1, maxRows: 2 },
								},
							})}
						</Col>

						<Col sm={12} span={24}>
							<Label label="TT-003" spacing />
							<FormRadioButton
								id="isVatExempted"
								items={isVatExemptedOptions}
							/>
							<ErrorMessage
								name="isVatExempted"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label label="Product Category" spacing />
							<FormSelect
								id="productCategory"
								options={getProductCategoriesOptions()}
							/>
							<ErrorMessage
								name="productCategory"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label id="pointSystemTagId" label="Point System Tag" spacing />
							<Select
								className="w-100"
								filterOption={filterOption}
								optionFilterProp="children"
								value={values.pointSystemTagId}
								allowClear
								showSearch
								onChange={(value) => {
									setFieldValue('pointSystemTagId', value);
								}}
							>
								{pointSystemTags.map((pointSystemTag) => (
									<Select.Option
										key={pointSystemTag.id}
										value={getId(pointSystemTag)}
									>
										{pointSystemTag.name}
									</Select.Option>
								))}
							</Select>
							<ErrorMessage
								name="pointSystemTagId"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label label="In Stock" spacing />
							<FormRadioButton id="isSoldInBranch" items={inStockOptions} />
							<ErrorMessage
								name="isSoldInBranch"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label label="Checking" spacing />
							<FormRadioButton
								id="checking"
								items={checkingTypesOptions}
								onChange={(value) => {
									setFieldValue(
										'isDailyChecked',
										value === productCheckingTypes.DAILY,
									);
									setFieldValue(
										'isRandomlyChecked',
										value === productCheckingTypes.RANDOM,
									);
								}}
							/>
							<ErrorMessage
								name="checking"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label label="TT-001" spacing />
							<FormRadioButton id="type" items={productTypeOptions} />
							<ErrorMessage
								name="type"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Divider dashed>QUANTITY</Divider>

						<Col sm={12} span={24}>
							<Label label="Reorder Point" spacing />
							<FormInput
								id="reorderPoint"
								isWholeNumber={
									values.unitOfMeasurement ===
									unitOfMeasurementTypes.NON_WEIGHING
								}
								type="number"
							/>
							<ErrorMessage
								name="reorderPoint"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col sm={12} span={24}>
							<Label label="Max Balance" spacing />
							<FormInput
								id="maxBalance"
								isWholeNumber={
									values.unitOfMeasurement ===
									unitOfMeasurementTypes.NON_WEIGHING
								}
								type="number"
							/>
							<ErrorMessage
								name="maxBalance"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Divider dashed>
							PRICES
							<br />
							<Text mark>(must be in 2 decimal places)</Text>
						</Divider>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'costPerPiece',
								label: 'Cost',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'wholeSalePrice',
								label: 'Wholesale Price',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'pricePerPiece',
								label: 'Regular Price',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'specialPrice',
								label: 'Special Price',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>

						<Col sm={12} span={24}>
							{renderInputField({
								name: 'creditPrice',
								label: 'Credit Price',
								setFieldValue,
								values,
								type: inputTypes.MONEY,
							})}
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button disabled={isLoading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							{product ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
