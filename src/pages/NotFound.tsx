import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NotFoundImage from "../assets/404.svg"

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <img src={NotFoundImage} alt="404 Not Found" className="max-w-[200px]" />
      <h1 className="text-xl md:text-3xl mt-6">404 - Page Not Found</h1>
      <p className="text-muted-foreground mt-2">You will be redirected to the dashboard in 10 seconds.</p>
    </div>
  );
}