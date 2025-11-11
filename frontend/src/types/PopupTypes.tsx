import type { User } from "./UserTypes";

export interface AdminTableProps {
  orderBy: keyof User;
  searchField: keyof User;
  searchValue: string;
}

export interface EditPopupProps {
  user: {
    id: number;
    name: string;
    mxUnd: number;
    mxImp: number;
  };
  onEdit: (updatedUser: { id: number; name: string; mxUnd: number; mxImp: number; password: string }) => void;
  onDelete: (userId: number) => void;
  onClose: () => void;
}

export interface RegisterPopupProps {
  close: (newUser?: { name: string; password: string; mxUnd: number; mxImp: number }) => void;
}