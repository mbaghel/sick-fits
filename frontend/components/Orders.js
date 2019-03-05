import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { formatDistance } from "date-fns";
import Link from "next/link";
import styled from "styled-components";
import OrderItemStyles from "./styles/OrderItemStyles";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";

const USER_ORDERS_QUERY = gql`
  query {
    orders {
      id
      items {
        id
        title
        image
        quantity
      }
      total
      createdAt
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

const Orders = () => {
  return (
    <Query query={USER_ORDERS_QUERY}>
      {({ data: { orders }, error, loading }) => {
        if (error) return <Error error={error} />;
        if (loading) return <p>Loading...</p>;
        return (
          <div>
            <h2>You have {orders.length} orders</h2>
            <OrderUl>
              {orders.map(order => (
                <OrderItemStyles key={order.id}>
                  <Link href={{ pathname: "/order", query: { id: order.id } }}>
                    <a>
                      <div className="order-meta">
                        <p>
                          {order.items.reduce((a, b) => a + b.quantity, 0)}{" "}
                          Items
                        </p>
                        <p>{order.items.length} Products</p>
                        <p>{formatDistance(order.createdAt, new Date())}</p>
                        <p>{formatMoney(order.total)}</p>
                      </div>
                      <div className="images">
                        {order.items.map(item => (
                          <img
                            src={item.image}
                            alt={item.title}
                            key={item.id}
                          />
                        ))}
                      </div>
                    </a>
                  </Link>
                </OrderItemStyles>
              ))}
            </OrderUl>
          </div>
        );
      }}
    </Query>
  );
};

export default Orders;
