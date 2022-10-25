import "./styles.css";
import { useEffect, useState } from "react";
import { GraphQLClient, gql } from "graphql-request";
let sessionHeaderToken;
const requestMiddleware = (request) => {
  console.log({ sessionHeaderToken }, 1);
  return {
    ...request,
    headers: {
      ...request.headers,
      "x-session": sessionHeaderToken
    }
  };
};

const responseMiddleware = (response) => {
  if (response.headers.get("X-Session")) {
    sessionHeaderToken = response.headers.get("x-session");
    console.log({ sessionHeaderToken });
  } else {
    sessionHeaderToken = "";
  }
};

const GQL_ENDPOINT = "https://complete-3d.swell.store/graphql";

const client = new GraphQLClient(GQL_ENDPOINT, {
  headers: {
    authorization: "pk_0hFjuD7rcOlOodyQF47Z5OTtIZjcXTmj"
  },
  requestMiddleware,
  responseMiddleware
});

const productsQuery = gql`
  query getProducts {
    products {
      results {
        id
        slug
        name
      }
    }
  }
`;

const getAllProducts = async () => {
  const res = await client.rawRequest(productsQuery);
  return res;
  // console.log(res);
};

async function addProductToCart(id, quantity = 1) {
  let mutation = gql`
    mutation addToCart($id: ID!, $quantity: Int!) {
      addCartItem(input: { productId: $id, quantity: $quantity }) {
        checkoutUrl
        grandTotal
        items {
          id
          product {
            id
            name
          }
        }
      }
    }
  `;
  const res = await client.rawRequest(mutation, { id, quantity });
  console.log({ res });
  return res;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  async function addToCart(id, quantity = 1) {}

  useEffect(() => {
    (async function () {
      try {
        const res = await getAllProducts();
        if (res) setProducts(res.data.products.results);
      } catch (e) {
        // console.log(e);
      }
    })();
  }, []);

  useEffect(() => {
    console.log(cart);
  }, [cart]);
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <ul>
        {products.length > 0 &&
          products.map((product) => {
            return (
              <li key={product.id}>
                <h4>{product.name}</h4>
                <button onClick={() => addProductToCart(product.id, 1)}>
                  add to cart
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
