"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/components/ui/use-toast";

import { ToastAction } from "@radix-ui/react-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const formSchema = z.object({
  username: z.string().min(4).max(15),
  password: z.string().min(4),
});

export function LoginForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      await login(values.username, values.password);
      navigate("/dashboard");
      console.log("Login succsess");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Что-то пошло не так.",
        description: "Произошла ошибка при попытке входа, неверные данные.",
      });
      console.log("Invalid username or password");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя пользователя</FormLabel>
              <FormControl>
                <Input placeholder="Имя пользователя" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input placeholder="Пароль" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Войти
        </Button>
      </form>
    </Form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid h-screen place-items-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Вход</CardTitle>
          <CardDescription className="text-center">
            Необходимо войти, чтобы продолжить
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
