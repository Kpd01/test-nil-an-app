"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Trash2, Edit, RefreshCw, Search, Users, Activity, Award, Download } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  username: string
  display_name: string
  email?: string
  created_at: string
  updated_at: string
  last_active: string
  is_active: boolean
  session_count: number
  total_points: number
  quiz_completed: boolean
  messages_sent: number
  photos_uploaded: number
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Error loading users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      })

      if (response.ok) {
        toast.success("User updated successfully")
        fetchUsers()
        setIsEditDialogOpen(false)
        setEditingUser(null)
      } else {
        toast.error("Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Error updating user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("User deleted successfully")
        fetchUsers()
      } else {
        toast.error("Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Error deleting user")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActivityLevel = (user: User) => {
    const totalActivity = user.messages_sent + user.photos_uploaded + (user.quiz_completed ? 1 : 0)
    if (totalActivity >= 5) return { level: "High", color: "bg-green-500" }
    if (totalActivity >= 2) return { level: "Medium", color: "bg-yellow-500" }
    return { level: "Low", color: "bg-red-500" }
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.is_active).length,
    quizCompleted: users.filter((u) => u.quiz_completed).length,
    totalMessages: users.reduce((sum, u) => sum + u.messages_sent, 0),
    totalPhotos: users.reduce((sum, u) => sum + u.photos_uploaded, 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.quizCompleted}</p>
                <p className="text-xs text-muted-foreground">Quiz Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">💬</span>
              <div>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-pink-500">📸</span>
              <div>
                <p className="text-2xl font-bold">{stats.totalPhotos}</p>
                <p className="text-xs text-muted-foreground">Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </span>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Manage all registered users and their activity</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by username, display name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Filters and Bulk Actions */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter-status" className="text-sm">
                Status:
              </Label>
              <select
                id="filter-status"
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value === "all" ? "" : e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="filter-activity" className="text-sm">
                Activity:
              </Label>
              <select
                id="filter-activity"
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value === "all" ? "" : e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="high">High Activity</option>
                <option value="medium">Medium Activity</option>
                <option value="low">Low Activity</option>
              </select>
            </div>

            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-[250px] bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-[250px] bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-[250px] bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const activity = getActivityLevel(user)
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.display_name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                            {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${activity.color} text-white`}>
                            {activity.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>💬 {user.messages_sent} messages</div>
                            <div>📸 {user.photos_uploaded} photos</div>
                            <div>🎯 {user.quiz_completed ? "Quiz ✓" : "Quiz ✗"}</div>
                            <div>🔄 {user.session_count} sessions</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(user.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(user.last_active)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No users found matching your search." : "No users registered yet."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and settings.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <EditUserForm user={editingUser} onSave={handleUpdateUser} onCancel={() => setIsEditDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="absolute top-4 right-4">
            <Users className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account manually.</DialogDescription>
          </DialogHeader>
          <AddUserForm onCancel={() => {}} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface EditUserFormProps {
  user: User
  onSave: (user: Partial<User>) => void
  onCancel: () => void
}

function EditUserForm({ user, onSave, onCancel }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    display_name: user.display_name,
    email: user.email || "",
    is_active: user.is_active,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="display_name">Display Name</Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active User</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  )
}

interface AddUserFormProps {
  onCancel: () => void
}

function AddUserForm({ onCancel }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.username) {
      setError("Username is required")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create user")
      }

      toast.success("User created successfully")
      onCancel()
      // Refresh the user list
      window.location.reload()
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the user")
      toast.error(err.message || "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div>
        <Label htmlFor="username">Username (required)</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="username123"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">This will be used for login and cannot be changed later</p>
      </div>

      <div>
        <Label htmlFor="display_name">Display Name</Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          placeholder="John Doe"
        />
        <p className="text-xs text-muted-foreground mt-1">This is the name that will be shown to others</p>
      </div>

      <div>
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="user@example.com"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>
      </DialogFooter>
    </form>
  )
}
