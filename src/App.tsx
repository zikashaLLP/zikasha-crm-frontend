import AppRouter from "@/routes/AppRouter";
import { SidebarProvider } from "@/contexts/sidebar-context";

function App() {
  return( 
    <SidebarProvider>
      <AppRouter />
    </SidebarProvider> 
  );
}

export default App;
