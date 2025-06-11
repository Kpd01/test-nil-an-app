"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Trash2, Edit, Save, X, Plus } from "lucide-react"

// Sample data - in a real app, this would come from a database
const sampleMessages = [
  {
    id: 1,
    name: "Emma",
    message: "I hope you're having the best adventures when you read this! Your smile always brightened our days.",
    photo: null,
  },
  {
    id: 2,
    name: "Liam",
    message: "Remember that time we built that awesome fort? Keep building amazing things in your life!",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Olivia",
    message: "You were such a sweet kid. I hope you're still just as kind and curious at 18!",
    photo: null,
  },
]

const sampleTasks = {
  fun: [
    "Do your best dance move",
    "Sing the chorus of your favorite song",
    "Do 10 jumping jacks",
    "Tell a joke",
    "Make a funny face and hold it for 10 seconds",
  ],
  emotional: [
    "Share a memory with Nilan",
    "Tell us what you admire about Nilan",
    "Share a wish for Nilan's future",
    "Give Nilan a piece of advice",
    "Tell us how you met Nilan",
  ],
  silly: [
    "Speak in an accent for the next 2 minutes",
    "Pretend to be an animal of your choice",
    "Try to touch your nose with your tongue",
    "Do your best impression of a celebrity",
    "Make up a short rap about Nilan",
  ],
}

export function AdminDashboard() {
  const [messages, setMessages] = useState(sampleMessages)
  const [tasks, setTasks] = useState(sampleTasks)
  const [editingTask, setEditingTask] = useState<{ category: string; index: number } | null>(null)
  const [newTaskText, setNewTaskText] = useState("")
  const [newTask, setNewTask] = useState("")
  const [activeCategory, setActiveCategory] = useState("fun")

  const deleteMessage = (id: number) => {
    setMessages(messages.filter((message) => message.id !== id))
  }

  const exportMessages = () => {
    // In a real app, this would generate a CSV or PDF
    const messagesText = messages.map((m) => `${m.name}: ${m.message}`).join("\n\n")
    const blob = new Blob([messagesText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Nilan-birthday-messages.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const startEditingTask = (category: string, index: number, text: string) => {
    setEditingTask({ category, index })
    setNewTaskText(text)
  }

  const saveEditedTask = () => {
    if (!editingTask || !newTaskText.trim()) return

    setTasks((prev) => {
      const newTasks = { ...prev }
      const category = editingTask.category as keyof typeof prev
      newTasks[category] = [...prev[category]]
      newTasks[category][editingTask.index] = newTaskText.trim()
      return newTasks
    })

    setEditingTask(null)
    setNewTaskText("")
  }

  const deleteTask = (category: string, index: number) => {
    setTasks((prev) => {
      const newTasks = { ...prev }
      const typedCategory = category as keyof typeof prev
      newTasks[typedCategory] = prev[typedCategory].filter((_, i) => i !== index)
      return newTasks
    })
  }

  const addNewTask = () => {
    if (!newTask.trim()) return

    setTasks((prev) => {
      const newTasks = { ...prev }
      const typedCategory = activeCategory as keyof typeof prev
      newTasks[typedCategory] = [...prev[typedCategory], newTask.trim()]
      return newTasks
    })

    setNewTask("")
  }

  return (
    <Tabs defaultValue="messages">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="tasks">Spin & Dare Tasks</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
      </TabsList>

      <TabsContent value="messages" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Guest Messages</CardTitle>
            <CardDescription>Messages that guests have written for 18-year-old Nilan</CardDescription>
            <Button variant="outline" size="sm" className="absolute top-4 right-4" onClick={exportMessages}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </CardHeader>
          <CardContent>
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className="p-4">
                    <div className="flex gap-4">
                      {message.photo ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={message.photo || "/placeholder.svg"}
                            alt={message.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-semibold text-gray-500">{message.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{message.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-gray-600 mt-1">{message.message}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No messages have been submitted yet.</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tasks" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Spin & Dare Tasks</CardTitle>
            <CardDescription>Manage the tasks that can be assigned to guests</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="fun" onValueChange={setActiveCategory}>
              <TabsList className="mb-4">
                <TabsTrigger value="fun">Fun</TabsTrigger>
                <TabsTrigger value="emotional">Emotional</TabsTrigger>
                <TabsTrigger value="silly">Silly</TabsTrigger>
              </TabsList>

              <TabsContent value="fun">
                <TaskList
                  tasks={tasks.fun}
                  category="fun"
                  editingTask={editingTask}
                  newTaskText={newTaskText}
                  setNewTaskText={setNewTaskText}
                  startEditingTask={startEditingTask}
                  saveEditedTask={saveEditedTask}
                  deleteTask={deleteTask}
                />
              </TabsContent>

              <TabsContent value="emotional">
                <TaskList
                  tasks={tasks.emotional}
                  category="emotional"
                  editingTask={editingTask}
                  newTaskText={newTaskText}
                  setNewTaskText={setNewTaskText}
                  startEditingTask={startEditingTask}
                  saveEditedTask={saveEditedTask}
                  deleteTask={deleteTask}
                />
              </TabsContent>

              <TabsContent value="silly">
                <TaskList
                  tasks={tasks.silly}
                  category="silly"
                  editingTask={editingTask}
                  newTaskText={newTaskText}
                  setNewTaskText={setNewTaskText}
                  startEditingTask={startEditingTask}
                  saveEditedTask={saveEditedTask}
                  deleteTask={deleteTask}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Label htmlFor="new-task">Add New Task</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="new-task"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder={`Add a new ${activeCategory} task...`}
                  onKeyDown={(e) => e.key === "Enter" && addNewTask()}
                />
                <Button onClick={addNewTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="photos" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Photo Gallery</CardTitle>
            <CardDescription>Manage photos uploaded by guests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="overflow-hidden group relative">
                  <img
                    src={`/placeholder.svg?height=200&width=200`}
                    alt={`Gallery photo ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download All Photos
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

interface TaskListProps {
  tasks: string[]
  category: string
  editingTask: { category: string; index: number } | null
  newTaskText: string
  setNewTaskText: (text: string) => void
  startEditingTask: (category: string, index: number, text: string) => void
  saveEditedTask: () => void
  deleteTask: (category: string, index: number) => void
}

function TaskList({
  tasks,
  category,
  editingTask,
  newTaskText,
  setNewTaskText,
  startEditingTask,
  saveEditedTask,
  deleteTask,
}: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.map((task, index) => (
        <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50">
          {editingTask && editingTask.category === category && editingTask.index === index ? (
            <div className="flex-1 flex gap-2">
              <Input
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveEditedTask()}
              />
              <Button size="sm" variant="ghost" onClick={saveEditedTask}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingTask(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1">{task}</div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => startEditingTask(category, index, task)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                onClick={() => deleteTask(category, index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
