import { routerMiddleware } from 'connected-react-router';
import { applyMiddleware, compose, createStore } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './ducks/index';
import { key as UI_KEY } from './ducks/ui';
import { APP_KEY } from './global/constants';
import rootSaga from './sagas/index';

export default function configureStore(initialState = {}, history: any): any {
	const persistConfig = {
		key: APP_KEY,
		storage,
		blacklist: ['_persist', UI_KEY],
		keyPrefix: '',
	};

	const sagaMiddleware = createSagaMiddleware();
	const middlewares = [sagaMiddleware, routerMiddleware(history)];

	const enhancers = [applyMiddleware(...middlewares)];
	const persistedReducer = persistReducer(persistConfig, rootReducer);

	const store = createStore(persistedReducer, initialState, compose(...enhancers));

	// run saga middleware
	sagaMiddleware.run(rootSaga);

	return store;
}
