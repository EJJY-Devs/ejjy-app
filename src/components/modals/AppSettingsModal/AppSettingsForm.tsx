import {
	Alert,
	Button,
	Col,
	Collapse,
	Divider,
	Input,
	InputNumber,
	Radio,
	Row,
	Select,
	Slider,
	Space,
} from 'antd';
import { filterOption, printingTypes } from 'ejjy-global';
import { ErrorMessage, Form, Formik, useFormikContext } from 'formik';
import { appTypes, headOfficeTypes, serviceTypes } from 'global';
import { useBranches } from 'hooks';
import qz from 'qz-tray';
import React, { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { FieldError, Label } from '../../elements';

interface Props {
	appType: string;
	branchId: string;
	headOfficeType: number;
	localApiUrl: string;
	onlineApiUrl: string;
	printerFontFamily: string;
	printerFontSize: string;
	printerName: string;
	tagPrinterFontFamily: string;
	tagPrinterFontSize: string;
	tagPrinterPaperHeight: string;
	tagPrinterPaperWidth: string;
	printingType: string;
	onClose: any;
	onSubmit: any;
}

const collapseKeys = {
	RECEIPT_PRINTER: 0,
	TAG_PRINTER: 1,
};

export const AppSettingsForm = ({
	appType,
	branchId,
	headOfficeType,
	localApiUrl,
	onClose,
	onlineApiUrl,
	onSubmit,
	printerFontFamily,
	printerFontSize,
	printerName,
	printingType,
	tagPrinterFontFamily,
	tagPrinterFontSize,
	tagPrinterPaperHeight,
	tagPrinterPaperWidth,
}: Props) => {
	// STATES
	const [baseURL, setBaseURL] = useState(onlineApiUrl || localApiUrl);

	// CUSTOM HOOKS
	const {
		data: { branches },
		isFetching: isFetchingBranches,
	} = useBranches({
		params: {
			baseURL,
			serviceType: serviceTypes.NORMAL,
		},
	});

	// METHODS
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				appType: appType || appTypes.BACK_OFFICE,
				headOfficeType,
				branchId: branchId || '',
				localApiUrl: localApiUrl || '',
				onlineApiUrl: onlineApiUrl || '',
				printerFontFamily,
				printerFontSize,
				printerName: printerName || '',
				printingType: printingType || printingTypes.HTML,
				tagPrinterPaperWidth,
				tagPrinterPaperHeight,
				tagPrinterFontFamily,
				tagPrinterFontSize,
			},
			Schema: Yup.object().shape({
				appType: Yup.string().label('App Type'),
				branchId: Yup.string().label('Branch'),
				headOfficeType: Yup.number().when('appType', {
					is: appTypes.HEAD_OFFICE,
					then: Yup.number().required().label('Head Office Type'),
				}),
				localApiUrl: Yup.string().required().label('Local API URL').trim(),
				onlineApiUrl: Yup.string().required().label('Online API URL').trim(),
				printerName: Yup.string().label('Printer Name'),
				printingType: Yup.string().label('Printing Type'),
				printerFontFamily: Yup.string()
					.required()
					.label('Printer Font Family')
					.trim(),
				printerFontSize: Yup.number().required().label('Printer Font Size'),
				tagPrinterPaperWidth: Yup.number()
					.required()
					.label('Tag Printer Paper Width'),
				tagPrinterPaperHeight: Yup.number()
					.required()
					.label('Tag Printer Paper Height'),
				tagPrinterFontFamily: Yup.string()
					.required()
					.label('Tag Printer Font Family')
					.trim(),
				tagPrinterFontSize: Yup.number()
					.required()
					.label('Tag Printer Font Size'),
			}),
		}),
		[
			appType,
			branchId,
			headOfficeType,
			localApiUrl,
			onlineApiUrl,
			printerFontFamily,
			printerFontSize,
			printerName,
			tagPrinterFontFamily,
			tagPrinterFontSize,
			tagPrinterPaperHeight,
			tagPrinterPaperWidth,
		],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={(values) => {
				onSubmit({
					...values,
					branchId:
						values.appType === appTypes.HEAD_OFFICE
							? undefined
							: values.branchId,
				});
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label id="appType" label="App Type" spacing />
							<Radio.Group
								buttonStyle="solid"
								options={[
									{ label: 'Back Office', value: appTypes.BACK_OFFICE },
									{
										label: 'Head Office',
										value: appTypes.HEAD_OFFICE,
									},
								]}
								optionType="button"
								value={values.appType}
								onChange={(e) => {
									setFieldValue('appType', e.target.value);
								}}
							/>
							{values.appType !== appType && (
								<Alert
									className="mt-1"
									message="App will relaunch after saving app settings."
									type="info"
									showIcon
								/>
							)}
							<ErrorMessage
								name="appType"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						{values.appType === appTypes.HEAD_OFFICE && (
							<Col span={24}>
								<Label label="Head Office Type" spacing />
								<Radio.Group
									buttonStyle="solid"
									options={[
										{ label: 'Main HO', value: headOfficeTypes.MAIN },
										{
											label: 'Not Main HO',
											value: headOfficeTypes.NOT_MAIN,
										},
										{
											label: 'Standalone HO (For testing)',
											value: headOfficeTypes.TEST,
										},
									]}
									optionType="button"
									value={values.headOfficeType}
									onChange={(e) => {
										setFieldValue('headOfficeType', e.target.value);
									}}
								/>
								<Alert
									className="mt-1"
									message="Main head office app starts the ngrok when opened."
									type="info"
									showIcon
								/>
								<ErrorMessage
									name="headOfficeType"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>
						)}

						<Col span={24}>
							<Label label="Local API URL" spacing />
							<Input
								name="localApiUrl"
								value={values['localApiUrl']}
								onChange={(e) => {
									setFieldValue('localApiUrl', e.target.value);
								}}
							/>
							<ErrorMessage
								name="localApiUrl"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="Online API URL" spacing />
							<Input
								name="onlineApiUrl"
								value={values['onlineApiUrl']}
								onBlur={(e) => {
									setBaseURL(e.target.value);
								}}
								onChange={(e) => {
									setFieldValue('onlineApiUrl', e.target.value);
								}}
								onFocus={(e) => {
									setBaseURL(e.target.value);
								}}
							/>
							<ErrorMessage
								name="onlineApiUrl"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						{values.appType === appTypes.BACK_OFFICE && (
							<Col span={24}>
								<Label label="Branch" spacing />
								<Select
									allowClear={false}
									className="w-100"
									filterOption={filterOption}
									loading={isFetchingBranches}
									optionFilterProp="children"
									value={values.branchId ? Number(values.branchId) : undefined}
									showSearch
									onChange={(value) => {
										setFieldValue('branchId', value);
									}}
								>
									{branches.map((branch) => (
										<Select.Option key={branch.id} value={branch.id}>
											{branch.name}
										</Select.Option>
									))}
								</Select>
								<ErrorMessage
									name="branchId"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>
						)}

						<Col span={24}>
							<Divider>Printers</Divider>

							<Label id="printingType" label="Printing Type" spacing />
							<Radio.Group
								buttonStyle="solid"
								options={[
									{ label: 'HTML', value: printingTypes.HTML },
									{
										label: 'Native',
										value: printingTypes.NATIVE,
									},
								]}
								optionType="button"
								value={values.printingType}
								onChange={(e) => {
									setFieldValue('printingType', e.target.value);
								}}
							/>
							<ErrorMessage
								name="printingType"
								render={(error) => <FieldError error={error} />}
							/>

							<Divider />

							<Collapse>
								<Collapse.Panel
									key={collapseKeys.RECEIPT_PRINTER}
									header="Receipt Printer"
								>
									<ReceiptPrinter />
								</Collapse.Panel>
								<Collapse.Panel
									key={collapseKeys.TAG_PRINTER}
									header="Tag Printer"
								>
									<TagPrinter />
								</Collapse.Panel>
							</Collapse>
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" type="primary">
							Submit
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};

const ReceiptPrinter = () => {
	// STATES
	const [printers, setPrinters] = useState([]);
	const [isFetchingPrinters, setIsFetchingPrinters] = useState(false);
	const [isPrintersFetched, setIsPrintersFetched] = useState(false);

	// HOOKS
	const {
		values,
		status,
		setFieldValue,
		setStatus,
	} = useFormikContext<Props>();

	// METHODS
	useEffect(() => {
		if (isPrintersFetched) {
			return;
		}

		if (!qz.websocket.isActive()) {
			setStatus({
				error: {
					printerName: 'Cannot connect to QZTray.',
				},
			});
			return;
		}

		setIsFetchingPrinters(true);

		qz.printers
			.find()
			.then((data) => {
				setIsPrintersFetched(true);
				setPrinters(data);
			})
			.catch(() => {
				setStatus({ error: { printerName: 'Unable to list printers.' } });
			})
			.finally(() => {
				setIsFetchingPrinters(false);
			});
	}, [isPrintersFetched]);

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<Label id="printerName" label="Printer Name" spacing />
				<Select
					className="w-100"
					disabled={status?.error?.printerName}
					filterOption={filterOption}
					loading={isFetchingPrinters}
					optionFilterProp="children"
					value={values['printerName']}
					allowClear
					showSearch
					onChange={(value) => {
						setFieldValue('printerName', value);
					}}
				>
					{printers.map((printer) => (
						<Select.Option key={printer} value={printer}>
							{printer}
						</Select.Option>
					))}
				</Select>
				<ErrorMessage
					name="printerName"
					render={(error) => <FieldError error={error} withSpaceTop />}
				/>
				{status?.error?.printerName && (
					<FieldError error={status.error.printerName} />
				)}
			</Col>

			{values.printingType === printingTypes.HTML && (
				<>
					<Col span={24}>
						<Label label="Printer Font Family" spacing />
						<Input
							name="printerFontFamily"
							value={values['printerFontFamily']}
							onChange={(e) => {
								setFieldValue('printerFontFamily', e.target.value);
							}}
						/>
						<ErrorMessage
							name="printerFontFamily"
							render={(error) => <FieldError error={error} />}
						/>
					</Col>
				</>
			)}

			<Col span={24}>
				<Label label="Printer Font Size" spacing />
				<Row gutter={[16, 16]}>
					<Col span={19}>
						<Slider
							max={100}
							min={1}
							value={Number(values['printerFontSize'])}
							onChange={(value) => {
								setFieldValue('printerFontSize', value);
							}}
						/>
					</Col>
					<Col span={5}>
						<InputNumber
							max={100}
							min={1}
							value={Number(values['printerFontSize'])}
							onChange={(value) => {
								setFieldValue('printerFontSize', value);
							}}
						/>
					</Col>
				</Row>

				<ErrorMessage
					name="printerFontSize"
					render={(error) => <FieldError error={error} />}
				/>
			</Col>
		</Row>
	);
};

const TagPrinter = () => {
	const { values, setFieldValue } = useFormikContext<Props>();

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<Label label="Tag Printer Paper Size (mm)" spacing />
				<Space>
					<InputNumber
						max={100}
						min={1}
						value={Number(values['tagPrinterPaperWidth'])}
						onChange={(value) => {
							setFieldValue('tagPrinterPaperWidth', value);
						}}
					/>
					<span>X</span>
					<InputNumber
						max={100}
						min={1}
						value={Number(values['tagPrinterPaperHeight'])}
						onChange={(value) => {
							setFieldValue('tagPrinterPaperHeight', value);
						}}
					/>
				</Space>

				<ErrorMessage
					name="tagPrinterPaperWidth"
					render={(error) => <FieldError error={error} />}
				/>
				<ErrorMessage
					name="tagPrinterPaperHeight"
					render={(error) => <FieldError error={error} />}
				/>
			</Col>

			{values.printingType === printingTypes.HTML && (
				<>
					<Col span={24}>
						<Label label="Tag Printer Font Family" spacing />
						<Input
							name="tagPrinterFontFamily"
							value={values['tagPrinterFontFamily']}
							onChange={(e) => {
								setFieldValue('tagPrinterFontFamily', e.target.value);
							}}
						/>
						<ErrorMessage
							name="tagPrinterFontFamily"
							render={(error) => <FieldError error={error} />}
						/>
					</Col>
				</>
			)}

			<Col span={24}>
				<Label label="Tag Printer Font Size" spacing />
				<Row gutter={[16, 16]}>
					<Col span={19}>
						<Slider
							max={100}
							min={1}
							value={Number(values['tagPrinterFontSize'])}
							onChange={(value) => {
								setFieldValue('tagPrinterFontSize', value);
							}}
						/>
					</Col>
					<Col span={5}>
						<InputNumber
							max={100}
							min={1}
							value={Number(values['tagPrinterFontSize'])}
							onChange={(value) => {
								setFieldValue('tagPrinterFontSize', value);
							}}
						/>
					</Col>
				</Row>

				<ErrorMessage
					name="tagPrinterFontSize"
					render={(error) => <FieldError error={error} />}
				/>
			</Col>
		</Row>
	);
};
