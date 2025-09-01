import { CloseCircleFilled } from '@ant-design/icons';
import { message } from 'antd';
import { ControlledInput } from 'components/elements';
import { getKeyDownCombination } from 'ejjy-global';
import { debounce } from 'lodash';
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import shallow from 'zustand/shallow';
import { searchShortcutKeys } from '../../../data';
import { useBoundStore } from '../../../stores/useBoundStore';
import '../style.scss';

// NOTE: Threshold length is 8 characters since is it almost impossible
// to input 8 characters consecutively within 250ms (Search Debounce Time).
const SCANNED_BARCODE_THRESHOLD = 8;
const SEARCH_DEBOUNCE_TIME = 250;

interface Props {
	barcodeScannerRef: any;
	isDisabled?: boolean;
	searchMode: any;
}

const Component = (
	{ barcodeScannerRef, isDisabled, searchMode }: Props,
	ref,
) => {
	// STATES
	const [inputText, setInputText] = useState('');
	// REFS
	const inputRef = useRef(null);

	const previousSearchedKey = useRef('');

	// CUSTOM HOOKS
	const { searchedText, setSearchedText } = useBoundStore(
		(state: any) => ({
			searchedText: state.searchedText,
			setSearchedText: state.setSearchedText,
		}),
		shallow,
	);

	// METHODS
	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []); // Add empty dependency array to run only once

	useEffect(() => {
		if (searchedText.length === 0) {
			setInputText('');
		}
	}, [searchedText]);

	const handleKeyDown = (event) => {
		const key = getKeyDownCombination(event);

		if (searchShortcutKeys.includes(key)) {
			if (inputRef?.current !== document.activeElement) {
				inputRef?.current?.focus();
			} else {
				inputRef?.current?.blur();
				setInputText('');
				setSearchedText('');
			}
		}
	};

	const handleSearchDebounced = useCallback(
		debounce((keyword) => {
			if (
				Math.abs(previousSearchedKey.current.length - keyword.length) >
				SCANNED_BARCODE_THRESHOLD
			) {
				// From barcode scanner
				setSearchedText('');
				setInputText('');
				previousSearchedKey.current = '';

				if (barcodeScannerRef.current) {
					barcodeScannerRef.current.handleScan(keyword);
				} else {
					message.error('An error occurred while scanning barcode.');
				}
			} else {
				// From normal input
				setSearchedText(keyword);
				previousSearchedKey.current = keyword;
			}
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	useImperativeHandle(ref, () => ({
		focusInput: () => {
			inputRef.current.focus();
		},
	}));

	let placeholder = '';
	if (searchMode === 'name') {
		placeholder = 'Search by product name';
	} else if (searchMode === 'sku') {
		placeholder = 'Search by SKU';
	} else if (searchMode === 'barcode') {
		placeholder = 'Search by barcode';
	} else {
		placeholder = 'Search';
	}

	return (
		<>
			<ControlledInput
				ref={inputRef}
				className="ProductSearch_input"
				disabled={isDisabled}
				placeholder={placeholder}
				value={inputText}
				onChange={(value) => {
					setInputText(value);
					handleSearchDebounced(value);
				}}
				onFocus={() => setInputText(inputText)}
			/>
			{searchedText.length > 0 && (
				<CloseCircleFilled
					className="ProductSearch_btnClear"
					onClick={() => setSearchedText('')}
				/>
			)}
		</>
	);
};

export const SearchInput = forwardRef(Component);
