import { HousePlug, Menu, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";
import { Button, } from "../ui/button";
import { useSelector } from "react-redux";
import { shoppingViewHeaderMenuItem } from "@/config";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";

function MenuItems() {
  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItem.map((menuItem) => (
        <Link
          key={menuItem.id}
          to={menuItem.path}
          className="text-sm  text-foreground hover:text-muted-foreground font-medium"
        >
          {menuItem.label}
        </Link>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <Button variant="outline" size="icon">
      <ShoppingCart  className='h-6 w-6'/>

        <span className="sr-only" > Cart</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-black   rounded-full">
            <AvatarFallback className="bg-black p-1  rounded-full text-white font-bold">
            SM
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" side="right">

        <DropdownMenuLabel>Logged in as</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated , user} = useSelector((state) => state.auth);
  console.log("user :", user)

  return (
    <header className="sticky top-0 z-40 border-b bg-background w-full">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          to="/shop/home"
          className="flex items-center gap-2 text-foreground hover:text-muted-foreground"
        >
          <HousePlug className="w-6 h-6" />
          <span className="font-bold">E-commerce</span>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs pt-6">
            <MenuItems />
          </SheetContent>
        </Sheet>

        <div className="hidden lg:block">
          <MenuItems />
        </div>

        {isAuthenticated ?  <div className="hidden lg:flex items-center gap-4">
          <HeaderRightContent/>
        </div> : null}
      </div>
    </header>
  );
}

export default ShoppingHeader;
