import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      closeButton
      duration={2600}
      visibleToasts={4}
      offset={20}
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-[22px] border border-border bg-card px-4 py-3 text-foreground shadow-[0_18px_40px_rgba(17,24,39,0.12)]",
          title: "font-semibold text-foreground",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-secondary text-foreground",
          closeButton: "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
