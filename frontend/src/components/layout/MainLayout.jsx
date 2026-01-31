export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <main className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        {children}
      </main>
    </div>
  );
}
