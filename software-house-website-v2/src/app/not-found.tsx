import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-8xl font-extrabold text-primary leading-none">404</h1>
        <h2 className="text-2xl font-bold text-primary mt-4 mb-4">Page Not Found</h2>
        <p className="text-gray-500 text-lg mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-7 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-dark transition-colors duration-150">
          Go Home
        </Link>
      </div>
    </section>
  );
}
