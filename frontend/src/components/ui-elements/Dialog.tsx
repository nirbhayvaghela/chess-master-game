import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProp {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "destructive" | "default"; // "destructive" for red, "default" for yellow
}

export const ConfirmDialog = ({
  trigger,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "destructive", // "destructive" or "default"
}: ConfirmDialogProp) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-secondary border-slate-700 text-white max-w-md backdrop:bg-black/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-lg font-semibold">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-slate-300">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 hover:border-slate-500"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-yellow-600 hover:bg-yellow-700 text-black"
            } border-0`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
