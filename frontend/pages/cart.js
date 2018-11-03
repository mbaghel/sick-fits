import Link from 'next/link'

const Cart = function() {
  return (
    <div>
      <p>Cart</p>
      <Link href="/">
        <a>Home</a>
      </Link>
    </div>
  );
};

export default Cart;