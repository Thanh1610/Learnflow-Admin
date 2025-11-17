import { Button } from "@heroui/button";
import ThemeSwitcher from "./components/ThemeSwitcher";

export default function Home() {
  return (
<div className="flex flex-wrap gap-4 items-center ">
      <Button color="primary" variant="solid" size="lg">
        Solid
      </Button>
      <Button color="primary" variant="faded">
        Faded
      </Button>
      <Button color="primary" variant="bordered">
        Bordered
      </Button>
      <Button color="primary" variant="light">
        Light
      </Button>
      <Button color="primary" variant="flat">
        Flat
      </Button>
      <Button color="primary" variant="ghost">
        Ghost
      </Button>
      <Button
      disableRipple
      className="relative overflow-visible rounded-full hover:-translate-y-1 px-12 shadow-sm bg-background/30 after:content-[''] after:absolute after:rounded-full after:inset-0 after:bg-background/40 after:z-[-1] after:transition after:duration-500! hover:after:scale-150 hover:after:opacity-0"
      size="lg"
    >
      Press me
    </Button>

      <ThemeSwitcher />
    </div>
  
  );
}
