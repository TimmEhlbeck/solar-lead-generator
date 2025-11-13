import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  Users,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
  Phone,
  UserCheck,
  Target,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface Statistics {
  total_leads: number;
  my_leads: number;
  new_leads: number;
  assigned_leads: number;
  contacted_leads: number;
  qualified_leads: number;
  converted_leads: number;
  lost_leads: number;
  my_new_leads: number;
  my_contacted_leads: number;
  my_qualified_leads: number;
  my_converted_leads: number;
  conversion_rate: number;
  my_conversion_rate: number;
  total_projects: number;
  my_projects: number;
}

interface StatusBreakdown {
  name: string;
  value: number;
  color: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  request_type: string;
  status: string;
  source: string;
  assigned_to: {
    id: number;
    name: string;
  } | null;
  project: {
    id: number;
    name: string;
  } | null;
  created_at: string;
}

interface LeadNeedingAttention {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  days_old: number;
}

interface RecentActivity {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  lead_id: number;
}

interface PerformanceMetrics {
  leads_assigned_30d: number;
  leads_contacted_30d: number;
  leads_converted_30d: number;
  response_time_avg: number;
}

interface SalesDashboardProps {
  auth: {
    user: {
      name: string;
      email: string;
    };
  };
  stats: Statistics;
  statusBreakdown: StatusBreakdown[];
  myStatusBreakdown: StatusBreakdown[];
  recentLeads: Lead[];
  myLeadsNeedingAttention: LeadNeedingAttention[];
  recentActivity: RecentActivity[];
  performanceMetrics: PerformanceMetrics;
}

export default function SalesDashboard({
  auth,
  stats,
  statusBreakdown,
  myStatusBreakdown,
  recentLeads,
  myLeadsNeedingAttention,
  recentActivity,
  performanceMetrics,
}: SalesDashboardProps) {
  const getStatusBadge = (status: string) => {
    const statusColors = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      qualified: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      lost: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };

    return statusColors[status as keyof typeof statusColors] || statusColors.new;
  };

  const getRequestTypeBadge = (type: string) => {
    const typeColors = {
      quote: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      consultation: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    };

    return typeColors[type as keyof typeof typeColors] || typeColors.quote;
  };

  return (
    <DashboardLayout auth={auth}>
      <Head title="Vertrieb Dashboard" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Vertrieb Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Willkommen zurück, {auth.user.name}
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Meine Leads
            </CardTitle>
            <UserCheck className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.my_leads}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              von {stats.total_leads} gesamt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Meine Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.my_conversion_rate}%
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Gesamt: {stats.conversion_rate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Meine Projekte
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.my_projects}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              von {stats.total_projects} gesamt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Benötigen Aufmerksamkeit
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {myLeadsNeedingAttention.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Neue oder kontaktierte Leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Lead Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Meine neuen Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.my_new_leads}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Meine kontaktierten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.my_contacted_leads}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Meine qualifizierten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.my_qualified_leads}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Meine konvertierten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.my_converted_leads}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics (Last 30 Days) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance der letzten 30 Tage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Leads zugewiesen</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics.leads_assigned_30d}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Phone className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Leads kontaktiert</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics.leads_contacted_30d}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Leads konvertiert</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics.leads_converted_30d}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* All Leads Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Alle Leads - Status Übersicht
            </CardTitle>
            <CardDescription>{stats.total_leads} Leads gesamt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-32">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${stats.total_leads > 0 ? (item.value / stats.total_leads) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Leads Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meine Leads - Status Übersicht
            </CardTitle>
            <CardDescription>{stats.my_leads} Leads mir zugewiesen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myStatusBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-32">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${stats.my_leads > 0 ? (item.value / stats.my_leads) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leads Needing Attention */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Leads benötigen Aufmerksamkeit
                </CardTitle>
                <CardDescription>Ihre ältesten nicht abgeschlossenen Leads</CardDescription>
              </div>
              <Link
                href="/sales/leads?assigned_to=me&status=new,assigned,contacted"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                Alle anzeigen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myLeadsNeedingAttention.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Alle Leads sind bearbeitet - gute Arbeit!
                </p>
              ) : (
                myLeadsNeedingAttention.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {lead.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 mt-1">
                        <Clock className="h-3 w-3" />
                        {lead.days_old} {lead.days_old === 1 ? 'Tag' : 'Tage'} alt
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Letzte Aktivitäten
                </CardTitle>
                <CardDescription>Ihre letzten 7 Tage</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Keine Aktivitäten in den letzten 7 Tagen
                </p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Neueste Leads</CardTitle>
              <CardDescription>Die 10 neuesten Anfragen</CardDescription>
            </div>
            <Link
              href="/sales/leads"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              Alle anzeigen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Keine Leads vorhanden
              </p>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {lead.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRequestTypeBadge(lead.request_type)}`}>
                        {lead.request_type === 'quote' ? 'Angebot' : 'Beratung'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-2">
                      <Clock className="h-3 w-3" />
                      {lead.created_at}
                      {lead.assigned_to && (
                        <>
                          <span>•</span>
                          <UserCheck className="h-3 w-3" />
                          {lead.assigned_to.name}
                        </>
                      )}
                      {lead.project && (
                        <>
                          <span>•</span>
                          <CheckCircle className="h-3 w-3" />
                          Projekt: {lead.project.name}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
