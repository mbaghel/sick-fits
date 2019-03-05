import Orders from "../components/Orders";
import PleaseSignIn from "../components/PleaseSignIn";

const OrdersPage = function(props) {
  return (
    <PleaseSignIn>
      <Orders />
    </PleaseSignIn>
  );
};

export default OrdersPage;
