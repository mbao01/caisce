"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  DropdownMenu,
  Fieldset,
  Input,
  ScrollArea,
  Select,
  Separator,
  Switch,
  Tabs,
  ThemeSwitch,
  toast,
  Toaster,
  Tooltip,
} from "@mbao01/common";
import { getTheme, saveTheme } from "@mbao01/common/utilities";
import { useChat } from "@ai-sdk/react";
import {
  Bot,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Link,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";

export const Chat = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [sources, setSources] = useState([
    { id: 1, title: "Company Documentation", url: "https://docs.example.com" },
    { id: 2, title: "Product Specs", url: "https://specs.example.com" },
  ]);
  const [newSource, setNewSource] = useState({ title: "", url: "" });
  const activeTheme = getTheme() ?? "system";

  const { messages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({
    api: "/api/chat",
    onFinish: () => {
      // Scroll to bottom when message is complete
      scrollToBottom();
    },
  });

  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addSource = () => {
    if (newSource.title && newSource.url) {
      setSources([...sources, { id: Date.now(), ...newSource }]);
      setNewSource({ title: "", url: "" });
      // toast({
      //   title: "Source added",
      //   description: `Added "${newSource.title}" to your knowledge base`,
      // });
      toast(`Added "${newSource.title}" to your knowledge base`);
    }
  };

  const removeSource = (id: number) => {
    const sourceToRemove = sources.find((source) => source.id === id);
    setSources(sources.filter((source) => source.id !== id));
    if (sourceToRemove) {
      // toast({
      //   title: "Source removed",
      //   description: `Removed "${sourceToRemove.title}" from your knowledge base`,
      // });
      toast(`Removed "${sourceToRemove.title}" from your knowledge base`);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // toast({
    //   title: "Copied to clipboard",
    //   description: "Message content copied to clipboard",
    // });
    toast("Message content copied to clipboard");
  };

  return (
    <div className="w-[400px] h-[600px] bg-background flex flex-col">
      <header className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <Avatar.Image src="/caisce.svg" className="size-6!" />
            <Avatar.Fallback className="text-primary">
              <Sparkles className="size-4 shrink-0" />
            </Avatar.Fallback>
          </Avatar>
          <h1 className="text-lg font-semibold text-center">caisce</h1>
        </div>

        <div className="flex items-center gap-1">
          <ThemeSwitch />
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4 py-2 sticky top-0 z-50 bg-base-100">
          <Tabs.List className="h-8 p-0.5 grid w-full grid-cols-3">
            <Tabs.Trigger value="chat" className="h-7 px-2 cursor-pointer">
              <Bot size={14} className="mr-1" />
              <span className="sm:inline">Chat</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="knowledge" className="h-7 px-2 cursor-pointer">
              <Database size={14} className="mr-1" />
              <span className="sm:inline">Knowledge</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="settings" className="h-7 px-2 cursor-pointer">
              <Settings size={14} className="mr-1" />
              <span className="sm:inline">Settings</span>
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <Tabs.Content
          value="chat"
          className="flex-1 flex flex-col h-full m-0 data-[state=active]:flex-1"
        >
          <ScrollArea className="flex-1 p-4" id="chat-messages">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Bot size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">RAG-powered Assistant</h3>
                <p className="text-sm max-w-xs">
                  Ask me anything! I'll use your knowledge base to provide accurate answers.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {["How does RAG work?", "What's in my knowledge base?", "Summarize my docs"].map(
                    (suggestion) => (
                      <Button
                        outline
                        key={suggestion}
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          handleInputChange({ target: { value: suggestion } } as any);
                          setTimeout(() => handleSubmit(new Event("submit") as any), 100);
                        }}
                      >
                        {suggestion}
                      </Button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`group flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-6 w-6 mr-2 mt-1 flex-shrink-0">
                        <Avatar.Fallback className="text-primary">
                          <Bot size={12} />
                        </Avatar.Fallback>
                      </Avatar>
                    )}

                    <div className="flex flex-col max-w-[75%]">
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted text-foreground rounded-tl-none"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      </div>

                      {message.role === "assistant" && message.content.includes("Source:") && (
                        <div className="mt-1 text-xs flex items-center gap-1">
                          <Badge outline className="text-xs py-0 h-5 bg-background">
                            <FileText size={10} className="mr-1" />
                            Retrieved from knowledge base
                          </Badge>
                        </div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-6 w-6 ml-1 mt-1 flex-shrink-0">
                        <Avatar.Fallback className="text-secondary">
                          <User size={12} />
                        </Avatar.Fallback>
                      </Avatar>
                    )}

                    {message.role !== "user" && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenu.Trigger asChild>
                            <Button variant="ghost" className="h-6 w-6 ml-1 mt-1">
                              <MoreVertical size={12} />
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end">
                            <DropdownMenu.Item onClick={() => copyMessage(message.content)}>
                              <Copy size={14} className="mr-2" />
                              Copy
                            </DropdownMenu.Item>
                            {message.role === "assistant" && (
                              <DropdownMenu.Item onClick={() => reload()}>
                                <RefreshCw size={14} className="mr-2" />
                                Regenerate
                              </DropdownMenu.Item>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <Avatar.Fallback className="bg-primary text-primary-foreground">
                        <Bot size={14} />
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="max-w-[75%] rounded-lg p-3 bg-muted rounded-tl-none">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t sticky bottom-0 z-50 bg-base-100">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask a question..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
              </Button>
            </form>
          </div>
        </Tabs.Content>

        <Tabs.Content
          value="knowledge"
          className="flex-1 overflow-auto m-0 data-[state=active]:flex-1"
        >
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="text-lg font-medium">Knowledge Base</h2>

              <Card border="solid" className="mb-6">
                <Card.Header className="pb-2">
                  <Card.Title className="text-sm">Add New Source</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <Fieldset>
                      <Fieldset.Label htmlFor="title">Title</Fieldset.Label>
                      <Input
                        id="title"
                        value={newSource.title}
                        onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                        placeholder="Documentation title"
                      />
                    </Fieldset>
                    <Fieldset>
                      <Fieldset.Label htmlFor="url">URL or Content</Fieldset.Label>
                      <Input
                        id="url"
                        value={newSource.url}
                        onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                        placeholder="https://example.com/docs"
                      />
                    </Fieldset>
                  </div>
                </Card.Content>
                <Card.Footer>
                  <Button
                    onClick={addSource}
                    disabled={!newSource.title || !newSource.url}
                    className="w-full"
                  >
                    <Plus size={16} className="mr-2" /> Add Source
                  </Button>
                </Card.Footer>
              </Card>

              <h3 className="text-sm font-medium mb-2">Current Sources</h3>
              {sources.length === 0 ? (
                <Card className="border-dashed">
                  <Card.Content className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                    <Database size={24} className="mb-2 opacity-50" />
                    <p className="text-sm">No sources added yet</p>
                    <p className="text-xs mt-1">Add sources to enhance your RAG assistant</p>
                  </Card.Content>
                </Card>
              ) : (
                <div className="space-y-2">
                  {sources.map((source) => (
                    <Card key={source.id} className="overflow-hidden">
                      <Card.Content className="p-0">
                        <div className="flex items-center p-3">
                          <div className="mr-3 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Link size={14} className="text-primary" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium truncate">{source.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {source.url}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Tooltip.Provider>
                              <Tooltip>
                                <Tooltip.Trigger asChild>
                                  <Button variant="ghost" className="h-8 w-8">
                                    <ExternalLink size={14} />
                                  </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                  <p>Open source</p>
                                </Tooltip.Content>
                              </Tooltip>
                            </Tooltip.Provider>

                            <Tooltip.Provider>
                              <Tooltip>
                                <Tooltip.Trigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => removeSource(source.id)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                  <p>Remove source</p>
                                </Tooltip.Content>
                              </Tooltip>
                            </Tooltip.Provider>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs.Content>

        <Tabs.Content
          value="settings"
          className="flex-1 overflow-auto m-0 data-[state=active]:flex-1"
        >
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">Settings</h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Model Settings</h3>
                  <Card>
                    <Card.Content className="p-4 space-y-4">
                      <Fieldset className="flex items-center justify-between">
                        <div>
                          <Fieldset.Label htmlFor="model">AI Model</Fieldset.Label>
                          <p className="text-xs text-muted-foreground">
                            Select the AI model to use
                          </p>
                        </div>
                        <Select defaultValue="gpt-4o">
                          <Select.Trigger className="w-[140px]">
                            <Select.Value placeholder="Select model" />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="gpt-4o">GPT-4o</Select.Item>
                            <Select.Item value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Item>
                            <Select.Item value="claude-3">Claude 3</Select.Item>
                          </Select.Content>
                        </Select>
                      </Fieldset>

                      <Separator />

                      <Fieldset className="flex items-center justify-between">
                        <div>
                          <Fieldset.Label htmlFor="temperature">Temperature</Fieldset.Label>
                          <p className="text-xs text-muted-foreground">Controls randomness (0-1)</p>
                        </div>
                        <Input
                          id="temperature"
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          defaultValue="0.7"
                          className="w-20"
                        />
                      </Fieldset>
                    </Card.Content>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">RAG Settings</h3>
                  <Card>
                    <Card.Content className="p-4 space-y-4">
                      <Fieldset className="flex items-center justify-between">
                        <div>
                          <Fieldset.Label htmlFor="embedding">Embedding Model</Fieldset.Label>
                          <p className="text-xs text-muted-foreground">
                            Model used for text embeddings
                          </p>
                        </div>
                        <Select defaultValue="text-embedding-3-small">
                          <Select.Trigger className="w-[180px]">
                            <Select.Value placeholder="Select model" />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="text-embedding-3-small">
                              text-embedding-3-small
                            </Select.Item>
                            <Select.Item value="text-embedding-3-large">
                              text-embedding-3-large
                            </Select.Item>
                          </Select.Content>
                        </Select>
                      </Fieldset>

                      <Separator />

                      <Fieldset className="flex items-center justify-between">
                        <div>
                          <Fieldset.Label htmlFor="chunks">Chunk Size</Fieldset.Label>
                          <p className="text-xs text-muted-foreground">
                            Number of tokens per chunk
                          </p>
                        </div>
                        <Input
                          id="chunks"
                          type="number"
                          min="100"
                          max="1000"
                          step="50"
                          defaultValue="500"
                          className="w-20"
                        />
                      </Fieldset>

                      <Separator />

                      <Fieldset className="flex items-center justify-between">
                        <div>
                          <Fieldset.Label htmlFor="topk">Top K Results</Fieldset.Label>
                          <p className="text-xs text-muted-foreground">
                            Number of chunks to retrieve
                          </p>
                        </div>
                        <Input
                          id="topk"
                          type="number"
                          min="1"
                          max="10"
                          step="1"
                          defaultValue="3"
                          className="w-20"
                        />
                      </Fieldset>
                    </Card.Content>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Interface Settings</h3>
                  <Card>
                    <Card.Content className="p-4 space-y-4">
                      <Fieldset className="flex items-center justify-between">
                        <div>
                          <Fieldset.Label htmlFor="streaming">Streaming Responses</Fieldset.Label>
                          <p className="text-xs text-muted-foreground">
                            Show responses as they're generated
                          </p>
                        </div>
                        <Switch id="streaming" defaultChecked />
                      </Fieldset>

                      <Separator />

                      <Fieldset className="flex items-center justify-between">
                        <div>
                          <Fieldset.Label htmlFor="citations">Show Citations</Fieldset.Label>
                          <p className="text-xs text-muted-foreground">
                            Display source information
                          </p>
                        </div>
                        <Switch id="citations" defaultChecked />
                      </Fieldset>

                      <Separator />

                      <Fieldset className="flex items-center justify-between">
                        <div>
                          <Fieldset.Label htmlFor="theme">Theme Preference</Fieldset.Label>
                          <p className="text-xs text-muted-foreground">
                            Choose light or dark theme
                          </p>
                        </div>
                        <Select defaultValue={activeTheme} onValueChange={saveTheme}>
                          <Select.Trigger className="w-[100px]">
                            <Select.Value placeholder="Theme" />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="light">Light</Select.Item>
                            <Select.Item value="dark">Dark</Select.Item>
                            <Select.Item value="system">System</Select.Item>
                          </Select.Content>
                        </Select>
                      </Fieldset>
                    </Card.Content>
                  </Card>
                </div>
              </div>
            </div>
          </ScrollArea>
        </Tabs.Content>
      </Tabs>
      <Toaster />
    </div>
  );
};
