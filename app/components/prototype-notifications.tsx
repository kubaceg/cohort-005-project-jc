// PROTOTYPE (throwaway): 3 variants of the in-app Notification UI, switched via ?variant=A|B|C
// on any /app-layout route. Static fake data, no Novu. Delete after the decision lands.
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Popover } from "radix-ui";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Inbox,
  Receipt,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { UserRole } from "~/db/schema";

type Kind = "refund" | "refund-failed" | "enrollment" | "seat" | "licence";

interface Item {
  id: number;
  kind: Kind;
  title: string;
  body: string;
  time: string;
  href: string;
  group: "Today" | "Earlier";
  unread: boolean;
}

const KIND_ICON: Record<Kind, { icon: typeof Bell; tone: string }> = {
  refund: { icon: Receipt, tone: "bg-blue-500/15 text-blue-600" },
  "refund-failed": { icon: CircleAlert, tone: "bg-red-500/15 text-red-600" },
  enrollment: { icon: UserPlus, tone: "bg-green-500/15 text-green-600" },
  seat: { icon: Users, tone: "bg-purple-500/15 text-purple-600" },
  licence: { icon: Users, tone: "bg-amber-500/15 text-amber-600" },
};

function sampleFor(role: UserRole | null, isTeamAdmin: boolean): Item[] {
  if (role === UserRole.Admin)
    return [
      { id: 1, kind: "refund-failed", title: "Refund failed", body: "Stripe rejected the refund for Maya Chen on “Advanced TypeScript”. Retry needed.", time: "4m ago", href: "/admin/refunds", group: "Today", unread: true },
      { id: 2, kind: "refund", title: "Refund requested", body: "Tom Reyes asked for a refund on “React Foundations”.", time: "1h ago", href: "/admin/refunds", group: "Today", unread: true },
      { id: 3, kind: "refund", title: "Refund requested", body: "Priya Nair asked for a refund on “Testing in Practice”.", time: "Yesterday", href: "/admin/refunds", group: "Earlier", unread: false },
    ];
  if (role === UserRole.Instructor)
    return [
      { id: 1, kind: "licence", title: "Team Licence purchased", body: "Acme Corp bought 10 seats of “Advanced TypeScript”.", time: "12m ago", href: "/instructor", group: "Today", unread: true },
      { id: 2, kind: "enrollment", title: "New enrollment", body: "Sam Okafor enrolled in “Advanced TypeScript”.", time: "2h ago", href: "/instructor", group: "Today", unread: true },
      { id: 3, kind: "enrollment", title: "New enrollment", body: "Lena Berg claimed a seat in “Advanced TypeScript”.", time: "2d ago", href: "/instructor", group: "Earlier", unread: false },
    ];
  const student: Item[] = [
    { id: 1, kind: "refund", title: "Refund approved", body: "Your refund for “React Foundations” was approved.", time: "20m ago", href: "/dashboard", group: "Today", unread: true },
    { id: 2, kind: "refund", title: "Refund issued", body: "$49.00 is on its way back to your card.", time: "3d ago", href: "/dashboard", group: "Earlier", unread: false },
  ];
  if (isTeamAdmin)
    student.unshift(
      { id: 3, kind: "seat", title: "Seat claimed", body: "Mia Lindqvist claimed a seat on your Team Licence for “Advanced TypeScript”.", time: "5m ago", href: "/team", group: "Today", unread: true },
      { id: 4, kind: "seat", title: "Seat claimed", body: "Lucas Moreau claimed a seat on your Team Licence for “Advanced TypeScript”.", time: "3h ago", href: "/team", group: "Today", unread: true },
      { id: 5, kind: "seat", title: "Seat claimed", body: "Zara Haddad claimed a seat on your Team Licence for “Advanced TypeScript”.", time: "Yesterday", href: "/team", group: "Earlier", unread: false },
    );
  return student;
}

function useFeed(role: UserRole | null, isTeamAdmin: boolean) {
  const empty = useSearchParams()[0].get("empty") === "1";
  const [items, setItems] = useState(() => sampleFor(role, isTeamAdmin));
  const shown = empty ? [] : items;
  return {
    items: shown,
    unread: shown.filter((i) => i.unread).length,
    markAll: () => setItems((s) => s.map((i) => ({ ...i, unread: false }))),
    markOne: (id: number) =>
      setItems((s) => s.map((i) => (i.id === id ? { ...i, unread: false } : i))),
  };
}

type Feed = ReturnType<typeof useFeed>;

function Badge({ n, className }: { n: number; className?: string }) {
  if (!n) return null;
  return (
    <span className={cn("flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white", className)}>
      {n}
    </span>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
      <Inbox className="size-8 opacity-40" />
      <div className="font-medium text-foreground">You're all caught up</div>
      <div>Refunds, enrollments and seat claims will show up here.</div>
    </div>
  );
}

function Row({ item, onRead, compact }: { item: Item; onRead: () => void; compact?: boolean }) {
  const { icon: Icon, tone } = KIND_ICON[item.kind];
  return (
    <Link
      to={item.href}
      onClick={onRead}
      className={cn("flex gap-3 px-4 py-3 text-left hover:bg-accent", item.unread && "bg-primary/5")}
    >
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", tone)}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm", item.unread ? "font-semibold" : "font-medium")}>{item.title}</span>
        {!compact && <span className="mt-0.5 block text-xs text-muted-foreground">{item.body}</span>}
        <span className="mt-1 block text-[11px] text-muted-foreground/70">{item.time}</span>
      </span>
      {item.unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
    </Link>
  );
}

// A: bell in sidebar header -> popover dropdown, flat list
function VariantA({ feed }: { feed: Feed }) {
  return (
    <Popover.Root>
      <Popover.Trigger className="relative ml-auto rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent">
        <Bell className="size-4" />
        <Badge n={feed.unread} className="absolute -right-0.5 -top-0.5" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="right" align="start" sideOffset={8} className="z-50 w-96 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {feed.unread > 0 && (
              <button onClick={feed.markAll} className="text-xs text-primary hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-96 divide-y overflow-y-auto">
            {feed.items.length === 0 ? <Empty /> : feed.items.map((i) => <Row key={i.id} item={i} onRead={() => feed.markOne(i.id)} />)}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// B: "Notifications" nav item with count -> right slide-over with All/Unread tabs and day groups
function VariantB({ feed }: { feed: Feed }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const list = feed.items.filter((i) => tab === "all" || i.unread);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Bell className="size-4" />
        <span className="flex-1 text-left">Notifications</span>
        <Badge n={feed.unread} className="size-5 text-[11px]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-[28rem] flex-col border-l bg-background shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b px-5">
              <h2 className="font-semibold">Notifications</h2>
              <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-accent"><X className="size-4" /></button>
            </div>
            <div className="flex items-center gap-1 border-b px-4 py-2 text-sm">
              {(["all", "unread"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-3 py-1 capitalize", tab === t ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
                  {t}{t === "unread" && feed.unread ? ` (${feed.unread})` : ""}
                </button>
              ))}
              <button onClick={feed.markAll} className="ml-auto text-xs text-primary hover:underline">Mark all read</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {list.length === 0 ? <Empty /> : (["Today", "Earlier"] as const).map((g) => {
                const rows = list.filter((i) => i.group === g);
                return rows.length === 0 ? null : (
                  <section key={g}>
                    <div className="sticky top-0 bg-muted/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">{g}</div>
                    {rows.map((i) => <Row key={i.id} item={i} onRead={() => { feed.markOne(i.id); setOpen(false); }} />)}
                  </section>
                );
              })}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

// C: no overlay; collapsible in-sidebar section, compact one-line rows, latest 3 only
function VariantC({ feed }: { feed: Feed }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mt-3 border-t border-sidebar-border pt-3">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
        Inbox <Badge n={feed.unread} />
        <ChevronDown className={cn("ml-auto size-3.5 transition-transform", !open && "-rotate-90")} />
      </button>
      {open && (
        <div className="text-sidebar-foreground">
          {feed.items.length === 0 ? (
            <div className="px-3 py-3 text-xs text-sidebar-foreground/50">Nothing new.</div>
          ) : (
            <>
              {feed.items.slice(0, 3).map((i) => {
                const { icon: Icon } = KIND_ICON[i.kind];
                return (
                  <Link key={i.id} to={i.href} onClick={() => feed.markOne(i.id)} title={i.body} className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs hover:bg-sidebar-accent">
                    <Icon className="size-3.5 shrink-0 opacity-70" />
                    <span className={cn("flex-1 truncate", i.unread ? "font-semibold" : "opacity-60")}>{i.title}</span>
                    <span className="shrink-0 text-[10px] opacity-50">{i.time.replace(" ago", "")}</span>
                  </Link>
                );
              })}
              <button onClick={feed.markAll} className="px-3 pt-1 text-[11px] text-primary hover:underline">Mark all read</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const VARIANTS = [
  { key: "A", name: "Bell + popover", Comp: VariantA, slot: "header" },
  { key: "B", name: "Nav item + slide-over", Comp: VariantB, slot: "nav" },
  { key: "C", name: "Inline sidebar inbox", Comp: VariantC, slot: "nav" },
] as const;

export function useNotificationSlots(role: UserRole | null, isTeamAdmin: boolean) {
  const feed = useFeed(role, isTeamAdmin);
  const [params] = useSearchParams();
  const v = VARIANTS.find((x) => x.key === params.get("variant")) ?? VARIANTS[0];
  const el = <v.Comp feed={feed} />;
  return { headerSlot: v.slot === "header" ? el : null, navSlot: v.slot === "nav" ? el : null };
}

export function PrototypeSwitcher() {
  const [params, setParams] = useSearchParams();
  const idx = Math.max(0, VARIANTS.findIndex((x) => x.key === params.get("variant")));
  const go = (d: number) => {
    const next = new URLSearchParams(params);
    next.set("variant", VARIANTS[(idx + d + VARIANTS.length) % VARIANTS.length].key);
    setParams(next, { replace: true });
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input,textarea,[contenteditable]")) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-zinc-900 px-3 py-2 text-sm text-white shadow-xl">
      <button onClick={() => go(-1)}><ChevronLeft className="size-4" /></button>
      <span>{VARIANTS[idx].key} ({VARIANTS[idx].name})</span>
      <button onClick={() => go(1)}><ChevronRight className="size-4" /></button>
    </div>
  );
}
