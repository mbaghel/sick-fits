import Link from 'next/link'

const Home = function() {
  return (
    <div>
      <p>Home</p>
      <Link href="/cart">
        <a>Cart</a>
      </Link>
    </div>
  );
};

export default Home;
