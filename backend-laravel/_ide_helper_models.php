<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int $entreprise_id
 * @property int $plan_saas_id
 * @property \Illuminate\Support\Carbon $date_debut
 * @property \Illuminate\Support\Carbon $date_fin
 * @property string $statut
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Entreprise|null $entreprise
 * @property-read \App\Models\PlanSaaS $planSaaS
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement whereDateDebut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement whereDateFin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement whereEntrepriseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement wherePlanSaasId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement whereStatut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Abonnement whereUpdatedAt($value)
 */
	class Abonnement extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $user_id
 * @property int|null $entreprise_id
 * @property string $action
 * @property string $entite_concernee
 * @property \Illuminate\Support\Carbon $date_action
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property-read \App\Models\Entreprise|null $entreprise
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereAction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereDateAction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereEntiteConcernee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereEntrepriseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereUserId($value)
 */
	class AuditLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $exigence_dao_id
 * @property int|null $document_bibliotheque_id
 * @property string $statut
 * @property \Illuminate\Support\Carbon|null $date_verification
 * @property float|null $score_global
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\DocumentBibliotheque|null $documentBibliotheque
 * @property-read \App\Models\ExigenceDAO|null $exigenceDAO
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist whereDateVerification($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist whereDocumentBibliothequeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist whereExigenceDaoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist whereScoreGlobal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist whereStatut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConformiteChecklist whereUpdatedAt($value)
 */
	class ConformiteChecklist extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $entreprise_id
 * @property int|null $document_groupe_id
 * @property string $titre
 * @property string $categorie
 * @property string $chemin_fichier
 * @property \Illuminate\Support\Carbon|null $date_expiration
 * @property int $version
 * @property bool $is_current
 * @property \Illuminate\Support\Carbon $date_upload
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ConformiteChecklist> $conformiteChecklists
 * @property-read int|null $conformite_checklists_count
 * @property-read \App\Models\Entreprise|null $entreprise
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereCategorie($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereCheminFichier($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereDateExpiration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereDateUpload($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereDocumentGroupeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereEntrepriseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereIsCurrent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereTitre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque whereVersion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentBibliotheque withoutTrashed()
 */
	class DocumentBibliotheque extends \Eloquent {}
}

namespace App\Models{
/**
 * @property-read \App\Models\ProjetDAO|null $projetDAO
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentDAO newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentDAO newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentDAO query()
 */
	class DocumentDAO extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $raison_sociale
 * @property string $ice
 * @property string $adresse
 * @property int $credits_restants
 * @property string $statut
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Abonnement> $abonnements
 * @property-read int|null $abonnements_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DocumentBibliotheque> $documentBibliotheques
 * @property-read int|null $document_bibliotheques_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProjetDAO> $projetDAOs
 * @property-read int|null $projet_d_a_os_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TransactionCredit> $transactionCredits
 * @property-read int|null $transaction_credits_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise whereAdresse($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise whereCreditsRestants($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise whereIce($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise whereRaisonSociale($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise whereStatut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Entreprise withoutTrashed()
 */
	class Entreprise extends \Eloquent {}
}

namespace App\Models{
/**
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ConformiteChecklist> $conformiteChecklists
 * @property-read int|null $conformite_checklists_count
 * @property-read \App\Models\ResultatAnalyse|null $resultatAnalyse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExigenceDAO newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExigenceDAO newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExigenceDAO query()
 */
	class ExigenceDAO extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $projet_dao_id
 * @property string|null $contenu
 * @property string|null $chemin_export
 * @property \Illuminate\Support\Carbon|null $date_generation
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\ProjetDAO|null $projetDAO
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique whereCheminExport($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique whereContenu($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique whereDateGeneration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique whereProjetDaoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MemoireTechnique whereUpdatedAt($value)
 */
	class MemoireTechnique extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nom_plan
 * @property float $prix
 * @property int $credits_alloues
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Abonnement> $abonnements
 * @property-read int|null $abonnements_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS whereCreditsAlloues($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS whereNomPlan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS wherePrix($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlanSaaS whereUpdatedAt($value)
 */
	class PlanSaaS extends \Eloquent {}
}

namespace App\Models{
/**
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DocumentDAO> $documentDAOs
 * @property-read int|null $document_d_a_os_count
 * @property-read \App\Models\Entreprise|null $entreprise
 * @property-read \App\Models\MemoireTechnique|null $memoireTechnique
 * @property-read \App\Models\ResultatAnalyse|null $resultatAnalyse
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjetDAO newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjetDAO newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjetDAO onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjetDAO query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjetDAO withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjetDAO withoutTrashed()
 */
	class ProjetDAO extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $projet_dao_id
 * @property string|null $resume_global
 * @property \Illuminate\Support\Carbon|null $date_analyse
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ExigenceDAO> $exigenceDAOs
 * @property-read int|null $exigence_d_a_os_count
 * @property-read \App\Models\ProjetDAO|null $projetDAO
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ResultatAnalyse newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ResultatAnalyse newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ResultatAnalyse query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ResultatAnalyse whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ResultatAnalyse whereDateAnalyse($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ResultatAnalyse whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ResultatAnalyse whereProjetDaoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ResultatAnalyse whereResumeGlobal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ResultatAnalyse whereUpdatedAt($value)
 */
	class ResultatAnalyse extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $entreprise_id
 * @property string $type_transaction
 * @property int $montant
 * @property string|null $description
 * @property \Illuminate\Support\Carbon $date_transaction
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Entreprise|null $entreprise
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit whereDateTransaction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit whereEntrepriseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit whereMontant($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit whereTypeTransaction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCredit whereUpdatedAt($value)
 */
	class TransactionCredit extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $entreprise_id
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $dernier_login
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AuditLog> $auditLogs
 * @property-read int|null $audit_logs_count
 * @property-read \App\Models\Entreprise|null $entreprise
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProjetDAO> $projetDAOs
 * @property-read int|null $projet_d_a_os_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDernierLogin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEntrepriseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

