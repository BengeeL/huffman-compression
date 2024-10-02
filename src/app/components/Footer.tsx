export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className='text-white text-center p-4'>
      <p>&copy; {year} HMCompressor by Benjamin Lefebvre</p>
    </footer>
  );
}
