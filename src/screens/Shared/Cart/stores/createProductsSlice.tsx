import _ from 'lodash';

export const createProductsSlice: any = (set) => ({
	products: [],
	addProduct: (product, isDuplicate = false, originalKey = null) =>
		set((state) => {
			if (isDuplicate && originalKey) {
				const index = state.products.findIndex(
					(p) => p?.product?.key === originalKey,
				);
				if (index !== -1) {
					const newProducts = [...state.products];
					newProducts.splice(index + 1, 0, product);
					return { products: newProducts };
				}
			}
			// Default behavior: add to beginning
			return { products: [product, ...state.products] };
		}),
	editProduct: ({ key, product }) => {
		set((state) => {
			const index = state.products.findIndex((p) => {
				return p.product.key === key;
			});

			if (index >= 0) {
				const newProducts = _.cloneDeep(state.products);
				newProducts[index] = product;

				return { products: newProducts };
			}

			return { products: state.products };
		});
	},
	deleteProduct: ({ key, product }) => {
		set((state) => {
			const index = state.products.findIndex((p) => {
				return p.product.key === key && _.isEqual(p.product, product);
			});

			if (index >= 0) {
				const newProducts = _.cloneDeep(state.products);
				newProducts.splice(index, 1);

				return { products: newProducts };
			}

			return { products: state.products };
		});
	},
	resetProducts: () => set(() => ({ products: [] })),
});
