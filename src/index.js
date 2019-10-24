import { AUTH_TOKEN } from "./constants";
import { setContext } from "apollo-link-context";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

// 1
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

// 2
const httpLink = createHttpLink({
  uri: "http://localhost:4000"
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

// 3
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

// 4
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);

serviceWorker.unregister();

// 1 - Import the dependencies
// 2 - Create the `httpLink` that will connect to the `ApolloClient` instance
// 3 - Instantiate `ApolloClient` by passing in `httpLink` and a new instance of `InMemoryCache`
// 4 - Render the root component of the React app; which is wrapped by the higher-order component `ApolloProvider` with `client` passed as a prop
