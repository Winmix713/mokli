<?php
declare(strict_types=1);


// Set strict error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Set response headers
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

const JSON_FILE = 'combined_matches.json';
const DEFAULT_PAGE_SIZE = 100;

function calculateBothTeamsScoredPercentage(array $matches): float {
    if (empty($matches)) {
        return 0.0;
    }
    
    $bothTeamsScoredCount = array_reduce($matches, function(int $count, array $match): int {
        return $count + (($match['score']['home'] > 0 && $match['score']['away'] > 0) ? 1 : 0);
    }, 0);
    
    return round(($bothTeamsScoredCount / count($matches)) * 100, 2);
}

function calculateAverageGoals(array $matches): array {
    if (empty($matches)) {
        return [
            'average_total_goals' => 0.0,
            'average_home_goals' => 0.0,
            'average_away_goals' => 0.0
        ];
    }

    $totalMatches = count($matches);
    $goals = array_reduce($matches, function(array $acc, array $match): array {
        return [
            'total' => $acc['total'] + $match['score']['home'] + $match['score']['away'],
            'home' => $acc['home'] + $match['score']['home'],
            'away' => $acc['away'] + $match['score']['away']
        ];
    }, ['total' => 0, 'home' => 0, 'away' => 0]);

    return [
        'average_total_goals' => round($goals['total'] / $totalMatches, 2),
        'average_home_goals' => round($goals['home'] / $totalMatches, 2),
        'average_away_goals' => round($goals['away'] / $totalMatches, 2)
    ];
}

function calculateFormIndex(array $matches, string $team, int $recentGames = 5): float {
    $teamMatches = array_values(array_filter($matches, function(array $match) use ($team): bool {
        return strcasecmp($match['home_team'], $team) === 0 || strcasecmp($match['away_team'], $team) === 0;
    }));

    if (empty($teamMatches)) {
        return 0.0;
    }

    $recentMatches = array_slice($teamMatches, 0, $recentGames);
    $points = array_reduce($recentMatches, function(int $sum, array $match) use ($team): int {
        $isHomeTeam = strcasecmp($match['home_team'], $team) === 0;
        $homeScore = $match['score']['home'];
        $awayScore = $match['score']['away'];

        if ($isHomeTeam) {
            if ($homeScore > $awayScore) return $sum + 3;
            if ($homeScore === $awayScore) return $sum + 1;
        } else {
            if ($awayScore > $homeScore) return $sum + 3;
            if ($homeScore === $awayScore) return $sum + 1;
        }
        return $sum;
    }, 0);

    $maxPossiblePoints = count($recentMatches) * 3;
    return $maxPossiblePoints > 0 ? round(($points / $maxPossiblePoints) * 100, 2) : 0.0;
}

function calculateHeadToHeadStats(array $matches): array {
    if (empty($matches)) {
        return [
            'home_wins' => 0,
            'away_wins' => 0,
            'draws' => 0,
            'home_win_percentage' => 0.0,
            'away_win_percentage' => 0.0,
            'draw_percentage' => 0.0
        ];
    }

    $stats = array_reduce($matches, function(array $acc, array $match): array {
        if ($match['score']['home'] > $match['score']['away']) {
            $acc['home_wins']++;
        } elseif ($match['score']['home'] < $match['score']['away']) {
            $acc['away_wins']++;
        } else {
            $acc['draws']++;
        }
        return $acc;
    }, ['home_wins' => 0, 'away_wins' => 0, 'draws' => 0]);

    $totalMatches = count($matches);
    return [
        'home_wins' => $stats['home_wins'],
        'away_wins' => $stats['away_wins'],
        'draws' => $stats['draws'],
        'home_win_percentage' => round(($stats['home_wins'] / $totalMatches) * 100, 2),
        'away_win_percentage' => round(($stats['away_wins'] / $totalMatches) * 100, 2),
        'draw_percentage' => round(($stats['draws'] / $totalMatches) * 100, 2)
    ];
}

function filterMatches(array $matches, array $params): array {
    return array_filter($matches, function(array $match) use ($params): bool {
        foreach ($params as $key => $value) {
            if (!matchParameter($match, $key, $value)) {
                return false;
            }
        }
        return true;
    });
}

function matchParameter(array $match, string $key, string $value): bool {
    switch ($key) {
        case 'team':
            return matchesTeam($match, $value);
        case 'home_team':
            return matchesHomeTeam($match, $value);
        case 'away_team':
            return matchesAwayTeam($match, $value);
        case 'date':
            return matchesDate($match, $value);
        case (str_starts_with($key, 'score_')):
            return matchesScore($match, $key, $value);
        case 'both_teams_scored':
            return matchesBothTeamsScored($match, $value);
        default:
            return matchesDefault($match, $key, $value);
    }
}

function matchesTeam(array $match, string $value): bool {
    return strcasecmp($match['home_team'], $value) === 0 || 
           strcasecmp($match['away_team'], $value) === 0;
}

function matchesHomeTeam(array $match, string $value): bool {
    return strcasecmp($match['home_team'], $value) === 0;
}

function matchesAwayTeam(array $match, string $value): bool {
    return strcasecmp($match['away_team'], $value) === 0;
}

function matchesDate(array $match, string $value): bool {
    try {
        $matchDate = new DateTime($match['date']);
        $paramDate = new DateTime($value);
        return $matchDate >= $paramDate;
    } catch (Exception $e) {
        return false;
    }
}

function matchesScore(array $match, string $key, string $value): bool {
    $scoreType = str_replace('score_', '', $key);
    return isset($match['score'][$scoreType]) && 
           (string)$match['score'][$scoreType] === $value;
}

function matchesBothTeamsScored(array $match, string $value): bool {
    $bothScored = ($match['score']['home'] > 0 && $match['score']['away'] > 0);
    return $bothScored === filter_var($value, FILTER_VALIDATE_BOOLEAN);
}

function matchesDefault(array $match, string $key, string $value): bool {
    return isset($match[$key]) && strcasecmp((string)$match[$key], $value) === 0;
}

function getAvailableTeams(array $matches): array {
    $teams = array_reduce($matches, function(array $acc, array $match): array {
        if (!empty($match['home_team'])) {
            $acc[] = $match['home_team'];
        }
        if (!empty($match['away_team'])) {
            $acc[] = $match['away_team'];
        }
        return $acc;
    }, []);
    
    return array_values(array_unique($teams));
}

function calculateExpectedGoals(string $team, array $matches): float {
    if (empty($matches)) {
        return 0.0;
    }

    $teamMatches = array_filter($matches, function(array $match) use ($team): bool {
        return $match['home_team'] === $team || $match['away_team'] === $team;
    });

    if (empty($teamMatches)) {
        return 0.0;
    }

    $totalGoals = array_reduce($teamMatches, function(float $sum, array $match) use ($team): float {
        return $sum + ($match['home_team'] === $team ? 
            $match['score']['home'] : $match['score']['away']);
    }, 0.0);

    return round($totalGoals / count($teamMatches), 2);
}

function calculateBothTeamsToScoreProb(array $matches): float {
    if (empty($matches)) {
        return 0.0;
    }

    $bothScoredCount = count(array_filter($matches, function(array $match): bool {
        return $match['score']['home'] > 0 && $match['score']['away'] > 0;
    }));

    return round(($bothScoredCount / count($matches)) * 100, 2);
}

function predictWinner(string $homeTeam, string $awayTeam, array $matches): array {
    $h2hMatches = array_filter($matches, function(array $match) use ($homeTeam, $awayTeam): bool {
        return $match['home_team'] === $homeTeam && $match['away_team'] === $awayTeam;
    });

    if (empty($h2hMatches)) {
        return ['winner' => 'unknown', 'confidence' => 0.0];
    }

    $stats = array_reduce($h2hMatches, function(array $acc, array $match): array {
        if ($match['score']['home'] > $match['score']['away']) {
            $acc['home_wins']++;
        } elseif ($match['score']['home'] < $match['score']['away']) {
            $acc['away_wins']++;
        } else {
            $acc['draws']++;
        }
        return $acc;
    }, ['home_wins' => 0, 'away_wins' => 0, 'draws' => 0]);

    $totalMatches = count($h2hMatches);
    
    if ($stats['home_wins'] > $stats['away_wins']) {
        return ['winner' => 'home', 'confidence' => round($stats['home_wins'] / $totalMatches, 2)];
    } elseif ($stats['away_wins'] > $stats['home_wins']) {
        return ['winner' => 'away', 'confidence' => round($stats['away_wins'] / $totalMatches, 2)];
    } else {
        return ['winner' => 'draw', 'confidence' => round($stats['draws'] / $totalMatches, 2)];
    }
}

function runPrediction(string $homeTeam, string $awayTeam, array $matches): array {
    $homeExpectedGoals = calculateExpectedGoals($homeTeam, $matches);
    $awayExpectedGoals = calculateExpectedGoals($awayTeam, $matches);
    $bothTeamsToScoreProb = calculateBothTeamsToScoreProb($matches);
    $winnerPrediction = predictWinner($homeTeam, $awayTeam, $matches);

    return [
        'homeExpectedGoals' => $homeExpectedGoals,
        'awayExpectedGoals' => $awayExpectedGoals,
        'bothTeamsToScoreProb' => $bothTeamsToScoreProb,
        'predictedWinner' => $winnerPrediction['winner'],
        'confidence' => $winnerPrediction['confidence'],
        'modelPredictions' => [
            'randomForest' => $winnerPrediction['winner'] . '_win',
            'poisson' => [
                'homeGoals' => round($homeExpectedGoals),
                'awayGoals' => round($awayExpectedGoals)
            ],
            'elo' => [
                'homeWinProb' => $winnerPrediction['winner'] === 'home' ? 
                    $winnerPrediction['confidence'] : 
                    (1 - $winnerPrediction['confidence']) / 2,
                'drawProb' => $winnerPrediction['winner'] === 'draw' ? 
                    $winnerPrediction['confidence'] : 
                    (1 - $winnerPrediction['confidence']) / 3,
                'awayWinProb' => $winnerPrediction['winner'] === 'away' ? 
                    $winnerPrediction['confidence'] : 
                    (1 - $winnerPrediction['confidence']) / 2
            ]
        ]
    ];
}

try {
    if (!is_file(JSON_FILE)) {
        throw new RuntimeException("JSON file not found");
    }

    $jsonData = file_get_contents(JSON_FILE);
    if ($jsonData === false) {
        throw new RuntimeException("Failed to read JSON file");
    }

    $data = json_decode($jsonData, true, 512, JSON_THROW_ON_ERROR);
    $matches = $data['matches'] ?? [];

    // Sanitize and filter parameters
    $params = array_filter($_GET, fn($value) => $value !== '');
    $params = array_map(fn($value) => htmlspecialchars($value, ENT_QUOTES, 'UTF-8'), $params);

    $filteredMatches = filterMatches($matches, $params);

    // Sort matches by date descending
    usort($filteredMatches, fn($a, $b) => strtotime($b['date']) <=> strtotime($a['date']));

    // Pagination
    $page = max(1, (int)($_GET['page'] ?? 1));
    $pageSize = max(1, (int)($_GET['page_size'] ?? DEFAULT_PAGE_SIZE));
    $totalMatches = count($filteredMatches);
    $offset = ($page - 1) * $pageSize;

    $paginatedMatches = array_slice($filteredMatches, $offset, $pageSize);

    // Team analysis
    $homeTeam = $params['home_team'] ?? '';
    $awayTeam = $params['away_team'] ?? '';
    $teamAnalysis = null;
    $prediction = null;

    if ($homeTeam !== '' && $awayTeam !== '') {
        $teamAnalysisMatches = array_filter($filteredMatches, function(array $match) use ($homeTeam, $awayTeam): bool {
            return (strcasecmp($match['home_team'], $homeTeam) === 0 && 
                   strcasecmp($match['away_team'], $awayTeam) === 0) ||
                   (strcasecmp($match['home_team'], $awayTeam) === 0 && 
                   strcasecmp($match['away_team'], $homeTeam) === 0);
        });

        $teamAnalysis = [
            'home_team' => $homeTeam,
            'away_team' => $awayTeam,
            'matches_count' => count($teamAnalysisMatches),
            'both_teams_scored_percentage' => calculateBothTeamsScoredPercentage($teamAnalysisMatches),
            'average_goals' => calculateAverageGoals($teamAnalysisMatches),
            'home_form_index' => calculateFormIndex($filteredMatches, $homeTeam),
            'away_form_index' => calculateFormIndex($filteredMatches, $awayTeam),
            'head_to_head_stats' => calculateHeadToHeadStats($teamAnalysisMatches)
        ];

        $prediction = runPrediction($homeTeam, $awayTeam, $filteredMatches);
    }

    echo json_encode([
        'total_matches' => $totalMatches,
        'page' => $page,
        'page_size' => $pageSize,
        'matches' => array_values($paginatedMatches),
        'team_analysis' => $teamAnalysis,
        'prediction' => $prediction
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}