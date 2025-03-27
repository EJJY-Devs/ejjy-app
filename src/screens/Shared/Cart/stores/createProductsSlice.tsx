import _ from 'lodash';

export const createProductsSlice: any = (set) => ({
	products: [],
	addProduct: (product) =>
		set((state) => ({ products: [product, ...state.products] })),
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
	deleteProduct: (key) => {
		set((state) => {
			const newProducts = (state.products?.product ?? []).filter(
				(p) => p.key !== key,
			);

			return { products: newProducts };
		});
	},
	resetProducts: () => set(() => ({ products: [] })),
});
