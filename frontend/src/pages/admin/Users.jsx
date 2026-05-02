import React, { useEffect, useState } from "react";
import { Search, Plus, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ roll_number: "", name: "", email: "", password: "", role: "user" });

  const load = async () => {
    try {
      const response = await api.get("/users", { params: { q: q || undefined } });
      setUsers(response.data.data || []);
    } catch (e) { toast.error(formatApiError(e)); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      await api.post("/users", form);
      toast.success("User created");
      setOpen(false);
      setForm({ roll_number: "", name: "", email: "", password: "", role: "user" });
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User removed");
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Manage students and admins.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 flex-1 max-w-lg">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, roll number or email"
            data-testid="users-search"
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="users-add-btn" className="bg-brand-navy dark:bg-brand-amber dark:text-brand-navy">
              <Plus className="h-4 w-4 mr-1.5" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New User</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="users-form-name" />
              </div>
              <div>
                <Label>Roll Number</Label>
                <Input value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} data-testid="users-form-roll" />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger data-testid="users-form-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="users-form-email" />
              </div>
              <div className="col-span-2">
                <Label>Temporary Password</Label>
                <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="users-form-password" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit} data-testid="users-form-submit">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Roll No.</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-10 text-center text-muted-foreground">No users found.</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/30" data-testid={`user-row-${u.roll_number}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-brand-amber/15 text-brand-amber grid place-items-center">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{u.roll_number}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`chip ${u.role === "admin" ? "chip-overdue" : "chip-issued"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => remove(u.id)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive" data-testid={`user-delete-${u.roll_number}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
