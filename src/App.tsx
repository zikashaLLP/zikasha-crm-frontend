import AppRouter from "@/routes/AppRouter";
import { SidebarProvider } from "@/contexts/sidebar-context";
import './App.css'

function App() {
  return( 
    <SidebarProvider>
      <AppRouter />
    </SidebarProvider> 
  );
}

export default App;
