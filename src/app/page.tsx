import { Footer } from "./components/Footer";
import HomePage from "./pages/Home";

export default function Home() {
  return (
    <div className='flex flex-col items-center min-h-screen py-10'>
      <main>
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}
