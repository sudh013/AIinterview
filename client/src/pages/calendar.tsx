import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, ExternalLink, Plus, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const calendarProviderSchema = z.object({
  provider: z.enum(["google", "outlook", "calendly"]),
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().optional(),
  providerAccountId: z.string().optional(),
  calendarId: z.string().optional(),
});

const timeSlotSchema = z.object({
  calendarProviderId: z.string().min(1, "Calendar provider is required"),
  jobId: z.string().optional(),
  dayOfWeek: z.string().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  timezone: z.string().optional(),
});

type CalendarProvider = {
  id: number;
  userId: string;
  provider: "google" | "outlook" | "calendly";
  providerAccountId: string;
  calendarId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type TimeSlot = {
  id: number;
  calendarProviderId: number;
  jobId?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  createdAt: Date;
};

const dayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const providerNames = {
  google: "Google Calendar",
  outlook: "Microsoft Outlook",
  calendly: "Calendly"
};

export default function CalendarPage() {
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [showTimeSlotDialog, setShowTimeSlotDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch calendar providers
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["/api/calendar/providers"],
  });

  // Fetch jobs for time slot assignment
  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
  });

  // Create calendar provider
  const createProviderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof calendarProviderSchema>) => {
      return await apiRequest("/api/calendar/providers", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/providers"] });
      setShowProviderDialog(false);
      toast({
        title: "Success",
        description: "Calendar provider connected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect calendar provider",
        variant: "destructive",
      });
    },
  });

  // Create time slot
  const createTimeSlotMutation = useMutation({
    mutationFn: async (data: z.infer<typeof timeSlotSchema>) => {
      return await apiRequest("/api/calendar/time-slots", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/time-slots"] });
      setShowTimeSlotDialog(false);
      toast({
        title: "Success",
        description: "Time slot created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create time slot",
        variant: "destructive",
      });
    },
  });

  const providerForm = useForm<z.infer<typeof calendarProviderSchema>>({
    resolver: zodResolver(calendarProviderSchema),
    defaultValues: {
      provider: "google",
      accessToken: "",
      refreshToken: "",
      providerAccountId: "",
      calendarId: "",
    },
  });

  const timeSlotForm = useForm<z.infer<typeof timeSlotSchema>>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      calendarProviderId: "",
      jobId: "",
      dayOfWeek: "1",
      startTime: "09:00",
      endTime: "17:00",
      timezone: "UTC",
    },
  });

  const onSubmitProvider = (data: z.infer<typeof calendarProviderSchema>) => {
    createProviderMutation.mutate(data);
  };

  const onSubmitTimeSlot = (data: z.infer<typeof timeSlotSchema>) => {
    createTimeSlotMutation.mutate(data);
  };

  if (providersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calendar Integration</h1>
        <p className="text-gray-600">
          Connect your calendar services and set up availability for one-click interview scheduling.
        </p>
      </div>

      {/* Calendar Providers Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar Providers
              </CardTitle>
              <CardDescription>
                Connect your calendar services to enable automatic scheduling
              </CardDescription>
            </div>
            <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Calendar Provider</DialogTitle>
                </DialogHeader>
                <Form {...providerForm}>
                  <form onSubmit={providerForm.handleSubmit(onSubmitProvider)} className="space-y-4">
                    <FormField
                      control={providerForm.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="google">Google Calendar</SelectItem>
                              <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                              <SelectItem value="calendly">Calendly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={providerForm.control}
                      name="accessToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Token</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter access token" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={providerForm.control}
                      name="refreshToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refresh Token (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter refresh token" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={providerForm.control}
                      name="calendarId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calendar ID (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter calendar ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowProviderDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createProviderMutation.isPending}>
                        {createProviderMutation.isPending ? "Connecting..." : "Connect"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No calendar providers connected</h3>
              <p className="text-gray-600 mb-4">
                Connect your calendar service to enable automatic interview scheduling
              </p>
              <Button onClick={() => setShowProviderDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Provider
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider: CalendarProvider) => (
                <div key={provider.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{providerNames[provider.provider]}</h3>
                    <Badge variant={provider.isActive ? "default" : "secondary"}>
                      {provider.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Account: {provider.providerAccountId}
                  </p>
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Settings */}
      {providers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability Settings
                </CardTitle>
                <CardDescription>
                  Set your available time slots for interview scheduling
                </CardDescription>
              </div>
              <Dialog open={showTimeSlotDialog} onOpenChange={setShowTimeSlotDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Slot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Available Time Slot</DialogTitle>
                  </DialogHeader>
                  <Form {...timeSlotForm}>
                    <form onSubmit={timeSlotForm.handleSubmit(onSubmitTimeSlot)} className="space-y-4">
                      <FormField
                        control={timeSlotForm.control}
                        name="calendarProviderId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calendar Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {providers.map((provider: CalendarProvider) => (
                                  <SelectItem key={provider.id} value={provider.id.toString()}>
                                    {providerNames[provider.provider]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={timeSlotForm.control}
                        name="jobId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a job or leave blank for all jobs" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">All Jobs</SelectItem>
                                {jobs.map((job: any) => (
                                  <SelectItem key={job.id} value={job.id.toString()}>
                                    {job.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={timeSlotForm.control}
                        name="dayOfWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day of Week</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dayNames.map((day, index) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={timeSlotForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={timeSlotForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={timeSlotForm.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                <SelectItem value="America/Chicago">Central Time</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                <SelectItem value="Europe/London">London</SelectItem>
                                <SelectItem value="Europe/Paris">Paris</SelectItem>
                                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowTimeSlotDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createTimeSlotMutation.isPending}>
                          {createTimeSlotMutation.isPending ? "Creating..." : "Create Time Slot"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Set Your Availability</h3>
              <p className="text-gray-600 mb-4">
                Configure your available time slots to enable one-click interview scheduling
              </p>
              <Button onClick={() => setShowTimeSlotDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Time Slot
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}