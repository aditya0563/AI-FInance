"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function MainAreaError({ error, reset }) {
  useEffect(() => {
    console.error("Main Area Error Caught:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full border-rose-500/20 bg-rose-500/5 shadow-sm rounded-3xl">
        <CardHeader className="text-center pb-2">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
          <CardTitle className="text-2xl text-rose-600">Application Error</CardTitle>
          <CardDescription className="text-rose-600/80">
            A problem occurred while loading this section.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
          <Button 
            onClick={() => reset()} 
            variant="outline" 
            className="rounded-full border-rose-200 hover:bg-rose-100 hover:text-rose-700 text-rose-600"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
