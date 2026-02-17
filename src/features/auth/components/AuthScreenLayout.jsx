import AppHeader from "@/templates/Header/AppHeader";

const AuthScreenLayout = ({ children }) => {
  return (
    <div className="app">
      <AppHeader isMenuOpen={false} onMenuToggle={() => {}} showMenu={false} />
      <main className="px-7 py-6">
        {children}
      </main>
    </div>
  );
};

export default AuthScreenLayout;
