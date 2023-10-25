import { Provider } from "react-redux"
import { store, persistor } from "./config"
import { PersistGate } from "redux-persist/integration/react"

export const ReduxContext = (props) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {props.children}
            </PersistGate>
        </Provider>
    )
}
