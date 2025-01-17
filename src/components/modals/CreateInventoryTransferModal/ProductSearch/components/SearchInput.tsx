import { CloseCircleFilled } from '@ant-design/icons';
import { ControlledInput } from 'components/elements';
import { getKeyDownCombination } from 'ejjy-global';
import { NO_INDEX_SELECTED, searchShortcutKeys } from 'global';
import { debounce } from 'lodash';
import React, {
	MutableRefObject,
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
// import { BarcodeScannerHandle } from 'screens/Main/components/BarcodeScanner';
import '../../style.scss';
import { useUserInterfaceStore } from 'stores';

// NOTE: Threshold length is 8 characters since is it almost impossible
// to input 8 characters consecutively within 250ms (Search Debounce Time).
// const SCANNED_BARCODE_THRESHOLD = 8;
const SEARCH_DEBOUNCE_TIME = 250;

export interface SearchInputHandle {
	focusInput: () => void;
}

interface Props {
	activeIndex: number;
	// barcodeScannerRef: MutableRefObject<BarcodeScannerHandle | null>;
	branchProducts: any;
	searchedKey: string;
	onSearch: () => void;
	onSelect: () => void;
	setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
	setSearchedKey: any;
}

export const SearchInput = forwardRef<SearchInputHandle, Props>(
	(
		{
			activeIndex,
			// barcodeScannerRef,
			branchProducts,
			searchedKey,
			onSearch,
			onSelect,
			setActiveIndex,
			setSearchedKey,
		},
		ref,
	) => {
		// STATES
		const [isDisabled, setIsDisabled] = useState(false);

		// REFS
		const inputRef = useRef<HTMLInputElement | null>(null);
		const onSearchRef = useRef<(() => void) | null>(null);
		const previousSearchedKey = useRef('');

		// CUSTOM HOOKS
		const { userInterface, setUserInterface } = useUserInterfaceStore();
		// const { isTransactionSearched, saleType } = useCurrentTransactionStore();

		// METHODS
		useEffect(() => {
			document.addEventListener('keydown', handleKeyDown);

			return () => {
				document.removeEventListener('keydown', handleKeyDown);
			};
		});

		useEffect(() => {
			onSearchRef.current = onSearch;
		}, [onSearch]);

		// useEffect(() => {
		// 	setIsDisabled(isTransactionSearched || saleType === null);
		// }, [isTransactionSearched, saleType]);

		const handleKeyDown = (event: KeyboardEvent) => {
			if (userInterface.isModalVisible) {
				return;
			}

			const key = getKeyDownCombination(event);

			if (searchShortcutKeys.includes(key)) {
				if (inputRef?.current !== document.activeElement) {
					inputRef?.current?.focus();
				} else {
					inputRef?.current?.blur();
					setSearchedKey('');
					setUserInterface({ isSearchSuggestionVisible: false });
				}
			}
		};

		const handleKeyPress = (key: string, event: KeyboardEvent) => {
			event.preventDefault();
			event.stopPropagation();

			if (
				(key === 'up' || key === 'down') &&
				activeIndex === NO_INDEX_SELECTED
			) {
				setActiveIndex(0);
				return;
			}

			if (key === 'up') {
				setActiveIndex((value) => (value > 0 ? value - 1 : value));
				return;
			}

			if (key === 'down') {
				setActiveIndex((value) => {
					if (branchProducts?.length > 0) {
						return value < branchProducts.length - 1 ? value + 1 : value;
					}
					return value;
				});
				return;
			}

			if (key === 'enter' && activeIndex !== NO_INDEX_SELECTED) {
				onSelect();
				return;
			}

			if (key === 'esc') {
				setSearchedKey('');
				setUserInterface({ isSearchSuggestionVisible: false });
			}
		};

		const debounceSearchedChange = useCallback(
			debounce((keyword) => {
				// From normal input
				onSearchRef?.current?.();
				previousSearchedKey.current = keyword;
			}, SEARCH_DEBOUNCE_TIME),
			[],
		);

		useImperativeHandle(ref, () => ({
			focusInput: () => {
				inputRef?.current?.focus();
			},
		}));

		return (
			<KeyboardEventHandler
				handleKeys={['up', 'down', 'enter', 'esc']}
				isDisabled={branchProducts.length <= 0}
				onKeyEvent={handleKeyPress}
			>
				<ControlledInput
					ref={inputRef}
					className="ProductSearch_input"
					disabled={isDisabled}
					placeholder={
						isDisabled ? '' : 'Search by name, textcode or description'
					}
					value={searchedKey}
					onChange={(value) => {
						setSearchedKey(value);
						debounceSearchedChange(value);
					}}
					onFocus={() => {
						onSearchRef?.current?.();
					}}
				/>
				{searchedKey.length > 0 && (
					<CloseCircleFilled
						className="ProductSearch_btnClear"
						onClick={() => {
							setSearchedKey('');
							setUserInterface({ isSearchSuggestionVisible: false });
						}}
					/>
				)}
			</KeyboardEventHandler>
		);
	},
);

SearchInput.displayName = 'SearchInput';
