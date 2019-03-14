import React from "react";
import StripeCheckout from "react-stripe-checkout";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import NProgress from "nprogress";
import Router from "next/router";
import User, { CURRENT_USER_QUERY } from "./User";
import calcTotalPrice from "../lib/calcTotalPrice";

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      total
      charge
      items {
        id
        title
      }
    }
  }
`;

function tallyItems(cartItems) {
  return cartItems.reduce((tally, item) => tally + item.quantity, 0);
}

class TakeMyMoney extends React.Component {
  handleToken = async (token, createOrder) => {
    NProgress.start();
    const order = await createOrder({ variables: { token: token.id } }).catch(
      err => {
        alert(err.message);
      }
    );
    Router.push({
      pathname: "/order",
      query: { id: order.data.createOrder.id }
    });
  };

  render() {
    return (
      <User>
        {({ data: { me }, loading }) => {
          if (loading) return null;
          return (
            <Mutation
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
              {createOrder => (
                <StripeCheckout
                  amount={calcTotalPrice(me.cart)}
                  name="Sick Fits"
                  email={me.email}
                  stripeKey="pk_test_SVVS6ApEXHjuHRTU3uMojtT0"
                  description={`Order of ${tallyItems(me.cart)} items`}
                  image={
                    me.cart.length && me.cart[0].item && me.cart[0].item.image
                  }
                  currency="USD"
                  token={res => {
                    this.handleToken(res, createOrder);
                  }}
                >
                  {this.props.children}
                </StripeCheckout>
              )}
            </Mutation>
          );
        }}
      </User>
    );
  }
}
export default TakeMyMoney;
export { CREATE_ORDER_MUTATION };
