// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Loader2 } from "lucide-react";
// import { useState } from "react";

// interface ConfirmDialogProp {
//   trigger: React.ReactNode;
//   title?: string;
//   description?: string;
//   confirmText?: string;
//   cancelText?: string;
//   onConfirm: () => Promise<void> | void; // Modified to support async operations
//   onCancel?: () => void;
//   variant?: "destructive" | "default"; // "destructive" for red, "default" for yellow
//   isLeavingRoom?: boolean; // Optional prop to control loading state externally
// }

// export const ConfirmDialog = ({
//   trigger,
//   title = "Are you sure?",
//   description = "This action cannot be undone.",
//   confirmText = "Confirm",
//   cancelText = "Cancel",
//   onConfirm,
//   onCancel,
//   variant = "destructive", // "destructive" or "default"
//   isLeavingRoom = false, // Optional prop to control loading state externally
// }: ConfirmDialogProp) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(isLeavingRoom);

//   const handleConfirm = async () => {
//     setIsLoading(true);
//     try {
//       await onConfirm();
//       // Only close the dialog after the operation completes
//       setIsOpen(false);
//     } catch (error) {
//       console.error("Error in confirm action:", error);
//       // Optionally handle error here
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     if (onCancel) {
//       onCancel();
//     }
//     setIsOpen(false);
//   };

//   const handleOpenChange = (open: boolean) => {
//     // Prevent closing when loading
//     if (!isLoading) {
//       setIsOpen(open);
//       // Reset loading state when dialog is closed
//       if (!open) {
//         setIsLoading(false);
//       }
//     }
//   };

//   return (
//     <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
//       <AlertDialogTrigger asChild>
//         {trigger}
//       </AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>{title}</AlertDialogTitle>
//           {description && (
//             <AlertDialogDescription>
//               {description}
//             </AlertDialogDescription>
//           )}
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel 
//             onClick={handleCancel}
//             disabled={isLoading}
//           >
//             {cancelText}
//           </AlertDialogCancel>
//           <AlertDialogAction
//             onClick={handleConfirm}
//             className={variant === "destructive" ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Loading...
//               </>
//             ) : (
//               confirmText
//             )}
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// };


"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-2">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Leaving..." : "Leave Room"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
