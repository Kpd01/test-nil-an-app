import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagement } from "./user-management"

export function AdminDashboard() {
  return (
    <Tabs defaultValue="messages" className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-[#f9e076]/50">
        <TabsTrigger value="messages" className="data-[state=active]:bg-[#ffb347] data-[state=active]:text-white">
          Bus Messages
        </TabsTrigger>
        <TabsTrigger value="tasks" className="data-[state=active]:bg-[#ffb347] data-[state=active]:text-white">
          Party Challenges
        </TabsTrigger>
        <TabsTrigger value="photos" className="data-[state=active]:bg-[#ffb347] data-[state=active]:text-white">
          Bus Photos
        </TabsTrigger>
        <TabsTrigger value="admin" className="data-[state=active]:bg-[#ffb347] data-[state=active]:text-white">
          Admin Tools
        </TabsTrigger>
        <TabsTrigger value="users" className="data-[state=active]:bg-[#ffb347] data-[state=active]:text-white">
          User Management
        </TabsTrigger>
      </TabsList>
      <TabsContent value="messages">Messages content</TabsContent>
      <TabsContent value="tasks">Tasks content</TabsContent>
      <TabsContent value="photos">Photos content</TabsContent>
      <TabsContent value="admin">Admin content</TabsContent>
      <TabsContent value="users" className="mt-6">
        <UserManagement />
      </TabsContent>
    </Tabs>
  )
}
