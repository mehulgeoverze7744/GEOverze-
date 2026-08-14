import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { creditReasons } from "@/features/credits/types";
import { num } from "@/lib/format";

export const Route = createFileRoute("/credits/adjustments")({
  head: () => ({
    meta: [
      { title: "Credit Adjustments — GEOverze Admin" },
      {
        name: "description",
        content: "Grant or deduct GEOcredits for a single member or in bulk with an audit reason.",
      },
      { property: "og:title", content: "Credit Adjustments — GEOverze Admin" },
      { property: "og:description", content: "Manual and bulk GEOcredit adjustments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreditAdjustmentsPage,
});

function CreditAdjustmentsPage() {
  const [member, setMember] = useState("");
  const [amount, setAmount] = useState(100);
  const [operation, setOperation] = useState("grant");
  const [reason, setReason] = useState<string>("Manual adjustment");
  const [note, setNote] = useState("");

  const [bulkList, setBulkList] = useState("");
  const [bulkAmount, setBulkAmount] = useState(50);
  const [bulkReason, setBulkReason] = useState<string>("Manual adjustment");
  const [confirmBulk, setConfirmBulk] = useState(false);

  const bulkTargets = bulkList
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const singleInvalid = !member.trim() || amount <= 0;

  return (
    <>
      <PageHeader
        title="Credit Adjustments"
        description="Grant or deduct GEOcredits with a recorded reason and audit trail."
      />

      <PageBody>
        <Tabs defaultValue="single">
          <TabsList>
            <TabsTrigger value="single">Single member</TabsTrigger>
            <TabsTrigger value="bulk">Bulk adjustment</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4">
            <form
              className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (singleInvalid) return;
                toast.success(
                  `${operation === "grant" ? "Granted" : "Deducted"} ${num(amount)} credits for ${member}.`,
                );
                setMember("");
                setNote("");
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="adj-member">Member email or ID</Label>
                  <Input
                    id="adj-member"
                    value={member}
                    onChange={(event) => setMember(event.target.value)}
                    placeholder="ada@geoverze.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adj-operation">Operation</Label>
                  <Select value={operation} onValueChange={setOperation}>
                    <SelectTrigger id="adj-operation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grant">Grant credits</SelectItem>
                      <SelectItem value="deduct">Deduct credits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adj-amount">Amount</Label>
                  <Input
                    id="adj-amount"
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adj-reason">Reason</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger id="adj-reason">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {creditReasons.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adj-note">Audit note</Label>
                <Textarea
                  id="adj-note"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Context recorded on the ledger entry."
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={singleInvalid}>
                  Apply adjustment
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-4">
              <div className="space-y-1.5">
                <Label htmlFor="bulk-list">Members</Label>
                <Textarea
                  id="bulk-list"
                  rows={5}
                  value={bulkList}
                  onChange={(event) => setBulkList(event.target.value)}
                  placeholder="One email or member ID per line"
                />
                <p className="text-xs text-muted-foreground">
                  {num(bulkTargets.length)} member{bulkTargets.length === 1 ? "" : "s"} detected
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bulk-amount">Credits per member</Label>
                  <Input
                    id="bulk-amount"
                    type="number"
                    min={1}
                    value={bulkAmount}
                    onChange={(event) => setBulkAmount(Number(event.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bulk-reason">Reason</Label>
                  <Select value={bulkReason} onValueChange={setBulkReason}>
                    <SelectTrigger id="bulk-reason">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {creditReasons.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  disabled={bulkTargets.length === 0 || bulkAmount <= 0}
                  onClick={() => setConfirmBulk(true)}
                >
                  Review bulk grant
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>

      <ConfirmDialog
        open={confirmBulk}
        onOpenChange={setConfirmBulk}
        title="Apply bulk credit grant?"
        description={`${num(bulkTargets.length)} members will each receive ${num(bulkAmount)} credits (${num(bulkTargets.length * bulkAmount)} total).`}
        confirmLabel="Apply grant"
        onConfirm={() => {
          toast.success(`Granted credits to ${num(bulkTargets.length)} members.`);
          setBulkList("");
          setConfirmBulk(false);
        }}
      />
    </>
  );
}
