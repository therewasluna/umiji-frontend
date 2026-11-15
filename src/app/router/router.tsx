import type { ComponentType } from 'react'

import { LoginPage } from '@pages/auth/login'
import { Oauth2CallbackPage } from '@pages/auth/oauth2-callback/oauth2-callback.page'
import { NotFoundPageComponent } from '@pages/errors/4xx-error'
import { ErrorPageComponent } from '@pages/errors/5xx-error'
import { SUBSCRIPTION_TEMPLATE_TYPE } from '@umiji/backend-contract'
import {
    createBrowserRouter,
    createRoutesFromElements,
    Navigate,
    Route,
    RouterProvider
} from 'react-router'

import { ErrorBoundaryHoc } from '@shared/hocs/error-boundary'
import { AuthGuard } from '@shared/hocs/guards/auth-guard'

import { ROUTES } from '../../shared/constants'
import { AuthLayout } from '../layouts/auth'

const lazyPage = (load: () => Promise<ComponentType>) => async () => ({
    Component: await load()
})

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<ErrorBoundaryHoc FallbackComponent={ErrorPageComponent} />}>
            <Route element={<AuthLayout />} path={ROUTES.OAUTH2.ROOT}>
                <Route element={<Oauth2CallbackPage />} path={ROUTES.OAUTH2.ROOT} />
            </Route>
            <Route element={<AuthGuard />}>
                <Route element={<Navigate replace to={ROUTES.DASHBOARD.ROOT} />} path="/" />
                <Route element={<AuthLayout />} path={ROUTES.AUTH.ROOT}>
                    <Route element={<Navigate replace to={ROUTES.AUTH.LOGIN} />} index />
                    <Route element={<LoginPage />} path={ROUTES.AUTH.LOGIN} />
                </Route>

                <Route
                    lazy={lazyPage(() =>
                        import('../layouts/dashboard/main-layout/layout').then((m) => m.MainLayout)
                    )}
                    path={ROUTES.DASHBOARD.ROOT}
                >
                    <Route element={<Navigate replace to={ROUTES.DASHBOARD.HOME} />} index />
                    <Route
                        lazy={lazyPage(() =>
                            import('@pages/dashboard/home/connectors').then(
                                (m) => m.HomePageConnector
                            )
                        )}
                        path={ROUTES.DASHBOARD.HOME}
                    />
                    <Route
                        lazy={lazyPage(() =>
                            import('@pages/dashboard/open-entity').then((m) => m.OpenEntityPage)
                        )}
                        path={ROUTES.DASHBOARD.OPEN_ENTITY}
                    />

                    <Route path={ROUTES.DASHBOARD.MANAGEMENT.ROOT}>
                        <Route
                            element={<Navigate replace to={ROUTES.DASHBOARD.MANAGEMENT.USERS} />}
                            index
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/users/ui/connectors').then(
                                    (m) => m.UsersPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.USERS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/hosts/ui/connectors').then(
                                    (m) => m.HostsPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.HOSTS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/nodes/ui/connectors').then(
                                    (m) => m.NodesPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.NODES}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/statistic-nodes/connectors').then(
                                    (m) => m.StatisticNodesConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.NODES_STATS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/subscription-settings/connectors').then(
                                    (m) => m.SubscriptionSettingsConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.SUBSCRIPTION_SETTINGS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/config-profiles/connectors').then(
                                    (m) => m.ConfigProfilesPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.CONFIG_PROFILES}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/config-profiles/connectors/config-profile-by-uuid.page.connector').then(
                                    (m) => m.ConfigProfileByUuidPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.CONFIG_PROFILE_BY_UUID}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/internal-squads/connectors').then(
                                    (m) => m.InternalSquadsPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.INTERNAL_SQUADS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/external-squads/connectors').then(
                                    (m) => m.ExternalSquadsPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.EXTERNAL_SQUADS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/brokers/connectors').then(
                                    (m) => m.BrokersPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.BROKERS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/broker-broadcast').then(
                                    (m) => m.BrokerBroadcastPage
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.BROKER_BROADCAST}
                        />

                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/nodes-metrics/ui/connectors').then(
                                    (m) => m.NodesMetricsPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.NODES_METRICS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/response-rules/connectors/response-rules.page.connector').then(
                                    (m) => m.ResponseRulesPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.RESPONSE_RULES}
                        />

                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/umiji-settings/connectors').then(
                                    (m) => m.UmijiSettingsConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.MANAGEMENT.UMIJI_SETTINGS}
                        />

                        <Route path={ROUTES.DASHBOARD.MANAGEMENT.NODE_PLUGINS.ROOT}>
                            <Route
                                lazy={lazyPage(() =>
                                    import('@pages/dashboard/node-plugins/ui/connectors/node-plugins-base-page.connector').then(
                                        (m) => m.NodePluginsBasePageConnector
                                    )
                                )}
                                index
                            />

                            <Route
                                lazy={lazyPage(() =>
                                    import('@pages/dashboard/node-plugins/ui/connectors/node-plugin-editor-page.connector').then(
                                        (m) => m.NodePluginEditorPageConnector
                                    )
                                )}
                                path={ROUTES.DASHBOARD.MANAGEMENT.NODE_PLUGINS.NODE_PLUGIN_BY_UUID}
                            />
                        </Route>
                    </Route>

                    <Route path={ROUTES.DASHBOARD.TOOLS.ROOT}>
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/hwid-inspector/ui/connectors').then(
                                    (m) => m.HwidInspectorPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.TOOLS.HWID_INSPECTOR}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/srh-inspector/ui/connectors').then(
                                    (m) => m.SrhInspectorPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.TOOLS.SRH_INSPECTOR}
                        />

                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/torrent-blocker-reports/ui/connectors').then(
                                    (m) => m.TorrentBlockerReportsPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.TOOLS.TORRENT_BLOCKER_REPORTS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/sessions-explorer/ui/connectors').then(
                                    (m) => m.SessionsExplorerPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.TOOLS.SESSIONS_EXPLORER}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/http-stats/ui/connectors/http-stats.page.connector').then(
                                    (m) => m.HttpStatsPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.TOOLS.HTTP_STATS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/quick-open').then((m) => m.QuickOpenPage)
                            )}
                            path={ROUTES.DASHBOARD.TOOLS.QUICK_OPEN}
                        />
                    </Route>

                    <Route path={ROUTES.DASHBOARD.TEMPLATES.ROOT}>
                        <Route
                            element={
                                <Navigate
                                    replace
                                    to={ROUTES.DASHBOARD.TEMPLATES.TEMPLATES_BY_TYPE.replace(
                                        ':type',
                                        SUBSCRIPTION_TEMPLATE_TYPE.XRAY_JSON
                                    )}
                                />
                            }
                            index
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/templates/ui/connectors/template-base-page.connector').then(
                                    (m) => m.TemplateBasePageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.TEMPLATES.TEMPLATES_BY_TYPE}
                        />

                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/templates/ui/connectors/template-editor-page.connector').then(
                                    (m) => m.TemplateEditorPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.TEMPLATES.TEMPLATE_EDITOR}
                        />
                    </Route>

                    <Route path={ROUTES.DASHBOARD.SUBPAGE_CONFIGS.ROOT}>
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/subpage-config/ui/connectors/subpage-config-base-page.connector').then(
                                    (m) => m.SubpageConfigBasePageConnector
                                )
                            )}
                            index
                        />

                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/subpage-config/ui/connectors/subpage-config-editor-page.connector').then(
                                    (m) => m.SubpageConfigEditorPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.SUBPAGE_CONFIGS.SUBPAGE_CONFIG_BY_UUID}
                        />
                    </Route>

                    <Route path={ROUTES.DASHBOARD.CRM.ROOT}>
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/crm/infra-billing/connectors/infra-billing.page.connector').then(
                                    (m) => m.InfraBillingPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.CRM.INFRA_BILLING}
                        />
                    </Route>

                    <Route path={ROUTES.DASHBOARD.BROKER.ROOT}>
                        <Route
                            element={<Navigate replace to={ROUTES.DASHBOARD.BROKER.OVERVIEW} />}
                            index
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/broker/overview').then(
                                    (m) => m.BrokerOverviewPage
                                )
                            )}
                            path={ROUTES.DASHBOARD.BROKER.OVERVIEW}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/broker/internal-squads').then(
                                    (m) => m.BrokerInternalSquadsPage
                                )
                            )}
                            path={ROUTES.DASHBOARD.BROKER.INTERNAL_SQUADS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/subpage-config/ui/connectors/subpage-config-editor-page.connector').then(
                                    (m) => m.SubpageConfigEditorPageConnector
                                )
                            )}
                            path={ROUTES.DASHBOARD.BROKER.SUBSCRIPTION_PAGE}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/broker/subscription-settings').then(
                                    (m) => m.BrokerSubscriptionSettingsPage
                                )
                            )}
                            path={ROUTES.DASHBOARD.BROKER.SUBSCRIPTION_SETTINGS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/broker/telegram-bot').then(
                                    (m) => m.BrokerTelegramBotPage
                                )
                            )}
                            path={ROUTES.DASHBOARD.BROKER.TELEGRAM_BOT}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/broker/telegram-texts').then(
                                    (m) => m.BrokerTelegramTextsPage
                                )
                            )}
                            path={ROUTES.DASHBOARD.BROKER.TELEGRAM_TEXTS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/broker/telegram-orders').then(
                                    (m) => m.BrokerTelegramOrdersPage
                                )
                            )}
                            path={ROUTES.DASHBOARD.BROKER.TELEGRAM_ORDERS}
                        />
                        <Route
                            lazy={lazyPage(() =>
                                import('@pages/dashboard/broker/telegram-stats').then(
                                    (m) => m.BrokerTelegramStatsPage
                                )
                            )}
                            path={ROUTES.DASHBOARD.BROKER.TELEGRAM_STATS}
                        />
                    </Route>
                </Route>

                <Route element={<NotFoundPageComponent />} path="*" />
            </Route>
        </Route>
    )
)

export function Router() {
    return <RouterProvider router={router} />
}
