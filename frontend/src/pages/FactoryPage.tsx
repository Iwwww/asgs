import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductsTable from "@/components/ui/ProductsTable";
import DropdownAccauntMenu from "@/components/ui/DropdownAccauntMenu";
import SideBar from "@/components/ui/SideBar";
import HamburgerMenu from "@/components/ui/HamburgerMenu";
import CategoriesTable from "@/components/ui/CategoriesTable";

export default function FactoryPageTest() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SideBar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <HamburgerMenu />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <div className="ml-auto flex gap-2">
            <DropdownAccauntMenu />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">Все товары</TabsTrigger>
                <TabsTrigger value="warehouse">На складе</TabsTrigger>
                <TabsTrigger value="categories">Категории</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all">
              <ProductsTable />
            </TabsContent>
            <TabsContent value="warehouse">
              <Card>
                <CardHeader>
                  <CardTitle>Товары на складе</CardTitle>
                  <CardDescription>Управление товарами</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="categories">
              <CategoriesTable />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
